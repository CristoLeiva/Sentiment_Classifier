var resa = require('./resa');
var S = require('string');
var sentiment = require('sentiment');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var math = require('mathjs');
var fs = require('fs');
var CronJob = require('cron').CronJob;
var db = require('./dbpedia_entities.js');

exports.cumulative_sentiment = 0;
var company_relevance = 0.5;
var product_relevance = 0.3;
var person_relevance = 0.2;
var total_sentiment_score = 0;
var number_tweets = 0;
var total_relevance = 0;

exports.sentiment = function (tweet, created_at) {
	var current_relevance = 0; //relevance of the current tweet
	var current_sentiment = 0; // contribution of current tweet to the cumulative sentiment value
	var current_score = 0;
	var company_uri_present = false;
	var product_uri_present = false;
	var person_uri_present = false;
	var company_found = false;
	var product_found = false;
	var person_found = false;

	// Map contains key as an URI of the resource and value is the boolean array of the four values where first value represents whether the URI is a company URI,
	// second value: whether it is related to the company; third value: whether it is product URI; fourth value: whether it is Person URI.
	//db.map.forEach(function (value, key) {
	//console.log(key + " : " + value);

	//});
	db.map.forEach(function (value, key) {
		if (value[0] == true)
			company_uri_present = true;
		if (value[1] == true && value[2] == true)
			product_uri_present = true;
		if (value[1] == true && value[3] == true)
			person_uri_present = true;

	});

	// check if the tweet contains a company name and add relevance accordingly
	if (company_uri_present) {
		//console.log('company URI present');
		company_found = true;
	} else if (tweet.toString().toLowerCase().indexOf(resa.company_name.toLowerCase()) >= 0) {
		//console.log('company name present');
		company_found = true;
	} else if (tweet.toString().indexOf(company_stock_symbol) >= 0) {
		//console.log('company stock symbol present');
		company_found = true;
	}

	if (company_found)
		current_relevance = current_relevance + company_relevance;
	// check if the product of the company present in the tweet and add relevance accordingly

	// total number of products of the company
	var number_of_products = resa.products.length;
	//variable that will store number of products found in the tweet
	var products_count = 0;
	var tokens = sentiment(tweet).tokens;

	if (product_uri_present) {
		products_count++;
	} else {
		for (var i = 0; i < number_of_products; i++) {
			if (tweet.toString().toLowerCase().indexOf(resa.products[i].toLowerCase()) >= 0) {
				products_count++;
				db.products_found.push(resa.products[i]);

			} else if (tokens.indexOf(resa.products[i].toLowerCase()) >= 0) {
				products_count++;
				db.products_found.push(resa.products[i]);
			}
		}
	}

	if (products_count > 0) {
		product_found = true;
		current_relevance = current_relevance + product_relevance;
	}

	// check if the key person of the company present in the tweet and add relevance accordingly

	var number_of_persons = resa.keypersons.length;
	var persons_count = 0;

	if (person_uri_present) {
		persons_count++;
	} else {
		for (var i = 0; i < number_of_persons; i++) {
			if (tweet.toString().toLowerCase().indexOf(resa.keypersons[i].toLowerCase()) >= 0) {

				persons_count++;
				db.persons_found.push(resa.keypersons[i]);

			}
		}
	}

	if (persons_count > 0) {
		current_relevance = current_relevance + person_relevance;
		person_found = true;
	}

	//increase the total number of tweets if the tweet is relevant
	if (current_relevance > 0)
		number_tweets++;

	//calculate sentiment of the tweet
	var tweet_sentiment;
	if (current_relevance > 0) {

		current_score = sentiment(tweet).score;
		var words = sentiment(tweet).words;
		var positive = sentiment(tweet).positive;
		var negative = sentiment(tweet).negative;
		var tweet_tokens = tweet.toString().toLowerCase().split(' ');
		var company_sentiment = 0;
		var product_sentiment = 0;
		var person_sentiment = 0;
		var company_index;

		var company_name_array = resa.company_name.toLowerCase().split(' ');
		if (company_found) {
			if (company_name_array.length == 1) {
				company_index = tokens.indexOf(resa.company_name.toLowerCase());

			} else {
				for (var i = 0; i < company_name_array.length; i++) {
					if (tokens.indexOf(company_name_array[i]) >= 0) {

						if (tokens.indexOf(company_name_array[i + 1]) >= 0) {

							company_index = tokens.indexOf(company_name_array[i]);

						}
					} else
						break;
				}
			}
		}

		if (company_index >= 0 && current_score != 0) {

			//look backward
			for (var i = company_index - 3; i < company_index; i++) {
				if (i < 0)
					continue;

				for (var j = 0; j < words.length; j++) {
					if (tokens[i].indexOf(words[j]) >= 0) {
						if (positive.indexOf(tokens[i]) >= 0)
							company_sentiment++;
						else
							company_sentiment--;

					}

				}
			}

			//look forward

			for (var i = company_index; i <= company_index + 3 && i <= tokens.length; i++) {
				for (var j = 0; j < words.length; j++) {
					if (tokens[i].indexOf(words[j]) >= 0) {
						if (positive.indexOf(tokens[i]) >= 0)
							company_sentiment++;
						else
							company_sentiment--;

					}

				}
			}

		}

		if (product_found && current_score != 0) {
			for (var i = 0; i < db.products_found.length; i++) {
				var product_index;
				var product_name_array = db.products_found[i].toLowerCase().split(' ');
				if (product_name_array.length == 1) {
					product_index = tokens.indexOf(db.products_found[i].toLowerCase());
				} else {
					for (var i = 0; i < product_name_array.length; i++) {
						if (tokens.indexOf(product_name_array[i]) >= 0) {
							if (i + 1 < product_name_array.length && tokens.indexOf(product_name_array[i + 1]) >= 0) {

								product_index = tokens.indexOf(product_name_array[i]);

							} else if (i + 2 < product_name_array.length && tokens.indexOf(product_name_array[i + 2]) >= 0) {

								product_index = tokens.indexOf(product_name_array[i]);
							}
						}
					}
				}
				if (product_index >= 0) {

					for (var i = product_index - 3; i < product_index; i++) {
						if (i < 0)
							continue;

						for (var j = 0; j < words.length; j++) {
							if (tokens[i].indexOf(words[j]) >= 0) {
								if (positive.indexOf(tokens[i]) >= 0)
									product_sentiment++;
								else
									product_sentiment--;

							}

						}
					}

					for (var i = product_index; i < product_index + 3 && i <= tokens.length; i++) {
						for (var j = 0; j < words.length; j++) {
							if (tokens[i].indexOf(words[j]) >= 0) {
								if (positive.indexOf(tokens[i]) >= 0)
									product_sentiment++;
								else
									product_sentiment--;

							}

						}
					}

				}

			}
		}

		if (person_found && current_score != 0) {
			for (var i = 0; i < db.persons_found.length; i++) {
				var person_index;
				var person_name_array = db.persons_found[i].toLowerCase().split(' ');
				if (person_name_array.length == 1) {
					person_index = tokens.indexOf(db.persons_found[i].toLowerCase());
				} else {
					for (var i = 0; i < person_name_array.length; i++) {
						if (tokens.indexOf(person_name_array[i]) >= 0) {
							if (i + 1 < person_name_array.length && tokens.indexOf(person_name_array[i + 1]) >= 0) {

								person_index = tokens.indexOf(person_name_array[i]);

							} else if (i + 2 < person_name_array.length && tokens.indexOf(person_name_array[i + 2]) >= 0) {

								person_index = tokens.indexOf(person_name_array[i]);
							}
						}
					}
				}
				if (person_index >= 0) {

					for (var i = person_index - 3; i < person_index; i++) {
						if (i < 0)
							continue;
						for (var j = 0; j < words.length; j++) {
							if (tokens[i].indexOf(words[j]) >= 0) {
								if (positive.indexOf(tokens[i]) >= 0)
									person_sentiment++;
								else
									product_sentiment--;

							}

						}
					}

					for (var i = person_index; i < person_index + 3 && i <= tokens.length; i++) {

						for (var j = 0; j < words.length; j++) {
							if (tokens[i].indexOf(words[j]) >= 0) {
								if (positive.indexOf(tokens[i]) >= 0)
									person_sentiment++;
								else
									person_sentiment--;

							}

						}
					}

				}

			}
		}

		tweet_sentiment = (company_relevance * company_sentiment) + (product_relevance * product_sentiment) + (person_relevance * person_sentiment);
		
		//calculate cumulative sentiment

		total_sentiment_score = total_sentiment_score + tweet_sentiment;
		if (number_tweets != 0)
			exports.cumulative_sentiment = total_sentiment_score / number_tweets;

		//normalize the cumulative_sentiment
		var senti = 0;
		if (exports.cumulative_sentiment > 0)
			senti = (1 - 1 / (1 + exports.cumulative_sentiment)) * 1;
		else
			senti = (1 - 1 / (1 + math.abs(exports.cumulative_sentiment))) * -1;
		exports.cumulative_sentiment = math.round(senti, 2);
		var avg_sentiment = exports.cumulative_sentiment;
		console.log('moving average sentiment:', exports.cumulative_sentiment);

		var stream2 = fs.createWriteStream("tweets.txt", {
				'flags' : 'a'
			});
		stream2.once('open', function (fd) {
			stream2.write("\n");
			stream2.write(tweet);
			stream2.write("\t");
			stream2.write(created_at);
			stream2.write("\n");
			stream2.end();
		});

	}

}
exports.setSentiment = function () {
	return exports.cumulative_sentiment;
}
exports.resetScores = function () {
	exports.cumulative_sentiment = 0;
	total_sentiment_score = 0;
	total_relevance = 0;
	number_tweets = 0;

}