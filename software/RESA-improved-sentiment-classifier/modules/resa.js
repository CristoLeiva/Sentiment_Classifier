//change it for using other NLP service
var default_nlp_api = "DBpedia-Spotlight";
// logger
var logger = require('../logger');
// config
var config = require('../config');
// async-await features
var async = require('asyncawait/async');
var await = require('asyncawait/await');
// async.js
var asyncUtil = require('async');
// filesystem stuff
var fs = require('fs');
// string.js
var S = require('string');
// lodash
var _ = require('lodash');
//sparql
var SparqlClient = require('sparql-client');
//util
var util = require('util');
var CronJob = require('cron').CronJob

	//Sentiment Calculation
	var sent_calc = require('./sentiment_calculation');
var db = require('./dbpedia_entities.js');
//twitter API
var twitter = require('ntwitter');
var twit = new twitter({
		consumer_key : config.twitter.consumerKey,
		consumer_secret : config.twitter.consumerSecret,
		access_token_key : config.twitter.accessTokenKey,
		access_token_secret : config.twitter.accessTokenSecret
	});
//global variable to toggle streams
var stop_streaming = 0;
// websocket server
var WebSocketServer = require('ws').Server;
var progressService;
var progressClients = [];
var annotationServices = {};
var company_info = [];
//SPARQL endpoint
var endpoint = 'http://dbpedia.org/sparql';
var Company = "";

//
// private functions
//

//
// WebSocket-based progress reporting server
//

var closeWebSocket = function () {
	logger.info('closing websocket');
	var wss = progressService;
	if (wss) {
		// close all connections
		wss.close();
		// dispose of the object
		wss = null;
	}
	delete progressService;
	// clean clients
	var clients = progressClients;
	// close all if exist
	if (clients) {
		clients.forEach(function (client) {
			client.close();
		});
	}
	// reset value
	delete progressClients;
};

var initWebSocket = function () {
	// construct url
	var socketURL = 'ws://' + config.defaultHost + ':' + config.defaultSocketPort + '/resa';
	// close old socket if exists
	//closeWebSocket(corpus);
	// log opening
	logger.info('Starting progress socket at: ', socketURL);
	// init server
	var wss = new WebSocketServer({
			//host: config.defaultHost,
			port : config.defaultSocketPort,
			path : '/resa'
		});

	// assign events
	wss.on('connection', function (ws) {
		logger.info('A client connected!');
		progressClients.push(ws);
		// add event listeners
		ws.on('close', function () {
			if (progressClients.length) {
				// remove from array
				var ind = progressClients.indexOf(ws);
				if (ind !== -1) {
					progressClients.splice(ind, 1);
				}
			}
		});
	});
	progressService = wss;
};

var reportAnalysisResult = function (tweet, result) {
	var entities = [];
	if (result.entities != undefined) {
		_.forEach(result.entities, function (entity) {
			entities.push({
				name : entity.name,
				uri : entity.uri,
				types : entity.types,
				offset : entity.offset
			});
		})
	}
	exports.output = {
		id : tweet.id,
		text : tweet.text,
		date : tweet.created_at,
		entities : entities
	}
	// get clients
	var clients = progressClients;
	// if any
	if (clients) {
		// send data to all
		clients.forEach(function (ws) {
			ws.send(JSON.stringify(exports.output));
		});
	}
	//call dbpedia_entities that processes the result of DBpedia Spotlight
	db.dbpedia_entities(tweet.text, tweet.created_at);

}

var annotate = function (nlp_api, tweet) {
	if (!annotationServices[nlp_api]) {
		logger.error('error! annotation service not found!', corpus);
		return;
	}
	// start input processing
	//logger.info("started input processing",annotationServices[nlp_api]);
	annotationServices[nlp_api]
	.process(tweet.text)
	.then(function (result) {
		//logger.info('result:',result);
		reportAnalysisResult(tweet, result);
	})
	.catch (function (err) {
		logger.error('error getting annotation from service', err);
		return callback(false);
	});

}

function getProducts(keyword, keypersons_search_list) {
	var query = "SELECT (str(?name) AS ?name) FROM <http://dbpedia.org> WHERE {?p rdfs:label ?name. " +
		"{SELECT ?p WHERE { " +
		"{?p <http://dbpedia.org/ontology/developer> " + keyword + "} " +
		"UNION " +
		"{?p <http://dbpedia.org/ontology/manufacturer> " + keyword + "} " +
		"UNION " +
		"{?p <http://dbpedia.org/ontology/designer> " + keyword + "} " +
		"UNION " +
		"{?p <http://dbpedia.org/ontology/builder> " + keyword + "} " +
		"UNION " +
		"{?p <http://dbpedia.org/property/developer> " + keyword + "} " +
		"UNION " +
		"{?p <http://dbpedia.org/property/owner> " + keyword + "} " +
		"UNION " +
		"{?p <http://dbpedia.org/property/currentowner> " + keyword + "} " +

		"}} " +
		"filter (lang(?name) = 'en' ). " +
		"} ";

	var products_list = "";
	//logger.info("query:::", query);
	var client = new SparqlClient(endpoint);
	client.query(query)
	.bind('?company', keyword)
	.execute(function (error, results) {
		if (error) {
			logger.info('server down', error);
		} else {
			if (results != null) {
				var items = Object.keys(results.results.bindings);
				exports.products = [];
				var products_search = [];

				items.forEach(function (item) {

					var prod = results.results.bindings[item].name.value;
					var product = '"' + prod + '"';
					exports.products.push(prod);
					products_search.push(product);

				});

				products_list = products_search.toString();
				logger.info("products::::", exports.products.toString());

				twit.stream('statuses/filter', {
					track : [exports.company_name, keypersons_search_list, products_list],
					language : 'en'
				}, function (stream) {
					stream.on('data', function (tweet) {
						if (stop_streaming) {
							stream.destroy();
						}

						annotate(default_nlp_api, tweet)

					});

				});

			}

		}
	});

}

function getKeyPersons(keyword) {

	var query = "SELECT distinct(str(?name) as ?name) FROM <http://dbpedia.org> WHERE{ ?p foaf:name ?name. " +
		"{SELECT distinct ?p  FROM <http://dbpedia.org> WHERE {" +
		"{?company <http://dbpedia.org/property/keyPeople> ?p}" +
		" UNION " +
		" {?company <http://dbpedia.org/ontology/keyPerson> ?p} " +
		" UNION " +
		" {?company <http://dbpedia.org/property/ceo> ?p} " +
		" UNION " +
		"{?company <http://dbpedia.org/property/editor> ?p} " +
		" UNION " +
		"{?company <http://dbpedia.org/property/chiefeditor> ?p} " +
		" UNION " +
		"{?company <http://dbpedia.org/property/publisher> ?p} " +
		" UNION " +
		"{?company <http://dbpedia.org/property/employer> ?p} " +
		" UNION " +
		" {?p <http://dbpedia.org/ontology/occupation> " + keyword + " } " +
		" UNION " +
		" {?p <http://dbpedia.org/ontology/board> " + keyword + " } " +
		" UNION " +
		" {?p <http://dbpedia.org/ontology/employer> " + keyword + " } " +
		" FILTER(EXISTS {?p rdfs:label ?label})} " +
		"}FILTER (!regex(?name,'[a-zA-Z],'))}";

	var keypersons_list = "";
	var keypersons_search_list = "";
	//logger.info("query:::", query);
	var client = new SparqlClient(endpoint);
	client.query(query)
	.bind('?company', keyword)
	.execute(function (error, results) {
		if (error) {
			logger.info('server down', error);
		} else {

			if (results != null) {
				var items = Object.keys(results.results.bindings);
				exports.keypersons = [];
				var keypersons_search = [];

				items.forEach(function (item) {

					var keyperson = results.results.bindings[item].name.value;
					var keyperson_search = exports.company_name + ' ' + '"' + keyperson + '"';

					exports.keypersons.push(keyperson);
					keypersons_search.push(keyperson_search)

				});

				logger.info("keypersons::::", exports.keypersons.toString());
				keypersons_search_list = keypersons_search.toString();
				getProducts(keyword, keypersons_search_list)

			}

		}
	});

}

function getCompanyName(keyword) {

	var query = "select (str(?name) as ?name) where {" +
		"?company rdfs:label ?name. " +
		"filter (lang(?name) = 'en' ).}";

	logger.info('keyword in getCompanyName', keyword);

	var client = new SparqlClient(endpoint);
	//logger.info("Query to " + endpoint);
	//logger.info("Query: " + query);
	client.query(query)
	.bind('?company', keyword)
	.execute(function (error, results) {
		if (error) {
			logger.info('server down', error);
		} else {

			if (results != null) {

				exports.company_name = results.results.bindings[0].name.value;
				logger.info('company_name in if:', exports.company_name);

				getKeyPersons(keyword);

			}
		}
	});

}

//
// public functions
//
function calcTime(offset) { //reference from http://www.techrepublic.com/article/convert-the-local-time-to-another-time-zone-with-this-javascript/

	d = new Date(); // get current date
	localTime = d.getTime(); //convert date to milliseconds
	localOffset = d.getTimezoneOffset() * 60000; // obtain local UTC offset and convert to msec
	utc = localTime + localOffset; // obtain UTC time in msec
	est = utc + (3600000 * offset); // obtain and add destination's UTC time offset
	nd = new Date(est); // convert msec value to date string
	var date = nd.getDate();
	if (date < 10)
		date = "0" + date;
	var month = nd.getMonth() + 1;
	if (month < 10)
		month = "0" + month;
	var year = nd.getFullYear();
	var hrs = nd.getHours();
	if (hrs < 10)
		hrs = "0" + hrs;
	var minutes = nd.getMinutes();
	if (minutes < 10)
		minutes = "0" + minutes;
	var seconds = nd.getSeconds();
	if (seconds < 10)
		seconds = "0" + seconds;
	var new_date_format = year + "-" + month + "-" + date + " " + hrs + ":" + minutes + ":" + seconds;
	console.log("ets time:", new_date_format);
	return new_date_format;
}

var CronJob = require('cron').CronJob;
var job = new CronJob({
		cronTime : '0 0 * * * *', //for 1 hour
		onTick : function () {

			var est_time = calcTime(-5); //-5 is offset for EST timezone
			var stream_p = fs.createWriteStream("sentiment.txt", {
					'flags' : 'a'
				});
			stream_p.once('open', function (fd) {
				//stream.write("\n");
				stream_p.write(sent_calc.cumulative_sentiment.toString());
				stream_p.write(est_time);
				stream_p.write("\n");
				stream_p.end();
			});

		},
		onComplete : undefined,
		start : false,
		timeZone : "EST"
	});

// new corpus creation
var startAnalysis = function (keyword) {
	initWebSocket();
	stop_streaming = 0;
	logger.info('Started Analysis:', keyword);
	var uri_prefix = "<http://dbpedia.org/resource/"
		exports.company_uri = "http://dbpedia.org/resource/" + keyword;
	keyword = uri_prefix + keyword + '>';
	job.start();
	getCompanyName(keyword);
};
var stopAnalysis = function () {
	logger.info('Stopped Analysis');
	job.stop();

	stop_streaming = 1;

	closeWebSocket();
};

var resetView = function () {
	logger.info('Reset the variables');

	sent_calc.resetScores();

	closeWebSocket();

};

// main module object
var ResaModule = function () {
	// autoload annotation modules
	fs.readdirSync(__dirname + '/annotationServices').forEach(function (moduleName) {
		var obj = require('./annotationServices/' + moduleName);
		annotationServices[obj.name] = obj;
	});
	this.startAnalysis = startAnalysis;
	this.stopAnalysis = stopAnalysis;
	this.resetView = resetView;
};

// export
module.exports = new ResaModule();