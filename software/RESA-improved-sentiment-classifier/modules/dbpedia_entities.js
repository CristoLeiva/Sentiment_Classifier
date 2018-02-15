var HashMap = require('hashmap').HashMap;
var resa = require('./resa');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var SparqlClient = require('sparql-client');
var endpoint = 'http://dbpedia.org/sparql';
var sent_calc = require('./sentiment_calculation');

exports.dbpedia_entities = function (tweet, created_at) {
	var company_uri_withbrackets = '<' + resa.company_uri + '>';
	exports.map = new HashMap();
	exports.products_found = [];
	exports.persons_found = [];
	if (resa.output != null) {
		if (resa.output.entities == null)
			resa.output.entities = [];
		var items = Object.keys(resa.output.entities);
		var length = resa.output.entities.length;
		var i = 0;
		if (length == 0) {
			sent_calc.sentiment(tweet, created_at);
		}
		items.forEach(function (item) {

			var is_product_uri = false;
			var is_company_uri = false;
			var is_preson_uri = false;
			var is_resource_associated = false;
			var resource_uri = resa.output.entities[item].uri;
			var resource_uri_withbrackets = '<' + resource_uri + '>';
			if (resource_uri.toLowerCase() == resa.company_uri.toLowerCase()) {
				is_company_uri = true;
			}
			var query = "ASK {" +
				"{ " + resource_uri_withbrackets + " ?x " + company_uri_withbrackets + " } " +
				" UNION " +
				"{ " + company_uri_withbrackets + " ?y " + resource_uri_withbrackets + "}}"

				var client = new SparqlClient(endpoint);
			client.query(query)
			.execute(function (error, results) {
				if (error) {
					console.log('server down', error);
				} else {
					if (results != null) {
						if (results.boolean)
							is_resource_associated = true;
					}
					if (is_resource_associated && resa.output.entities.length > 0 && resa.output.entities != 'undefined') {
						if (resa.output.entities[item].types != null && resa.output.entities[item].types.length > 0) {

							if ((resa.output.entities[item].types.indexOf('Schema:Product') >= 0) || (resa.output.entities[item].types.indexOf('DBpedia:Work') >= 0) || (resa.output.entities[item].types.indexOf('DBpedia:Device') >= 0)) {
								is_product_uri = true;

								exports.products_found.push(resa.output.entities[item].name);

							} else if (resa.output.entities[item].types.indexOf('DBpedia:Person') >= 0) {
								is_preson_uri = true;

								exports.persons_found.push(resa.output.entities[item].name);

							}
						}
					}
					// Map contains key as an URI of the resource and value is the boolean array of the four values where first value represents whether the URI is //a company URI,
					// second value: whether it is somehow related to the company; third value: whether it is product URI; fourth value: whether it is Person URI.
					var dbpedia_entities_identification = [];
					dbpedia_entities_identification.push(is_company_uri, is_resource_associated, is_product_uri, is_preson_uri);
					exports.map.set(resource_uri, dbpedia_entities_identification);
					i++;
					if (i == length) {
						sent_calc.sentiment(tweet, created_at);

						return;
					}

				}
			});

		});
	}

}