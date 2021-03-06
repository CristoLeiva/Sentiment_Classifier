var _ = require('lodash');
var bubblecloud = require('./bubblecloud');
var bar = require('./barChart');

var defaultPort = '8081';
//use jqlite instead of jquery
//$element === angular.element()
// === jQuery() === $()
//angular.element.find('.tweet');
var watchList = [];
var total_entities = 0;
module.exports = function ResaController($scope, $http, $sce) {
	//todo: initialize based on the selected view
	bubblecloud.initializeBubble();

	$scope.toggle_stop = 0;
	$scope.toggle_start = 1;
	$scope.tweets = [];
	$scope.tweets_number = 0;
	$scope.entities_number = 0;
	$scope.cumulative_sentiment = 0;
	$scope.reset_view = 1;
	$scope.companies = ['BMW', 'Toyota', 'Blackberry', 'Intel', 'Samsung', 'Sony', 'Vodafone', "McDonald's", 'BBC', 'Amazon', 'Walmart', 'Facebook', 'Unilever', 'Goldman_Sachs', 'Morgan_Stanley', 'Microsoft', 'Nokia', 'Apple_Inc.', 'Google'];
	$scope.intervals = ['5 Seconds', '1 Minute', '5 Minutes', '15 Minutes', '30 Minutes', '45 Minutes', '60 Minutes'];

	// analysis start function

	$scope.startAnalysis = function (e) {
		// prevent event
		e.preventDefault();
		$scope.toggle_stop = 1;
		$scope.toggle_start = 0;
		var x = document.getElementById("companylist")
			x.disabled = true;
		var y = document.getElementById("intervallist")
			y.disabled = true;

		var keyword = $scope.keyword;
		$http({
			url : "/api/resa/start/" + keyword,
			method : "GET"
		}).success(function (response) {

			$scope.response = response;

			initStreamWebsocket($scope);
		}).error(function (error) {
			$scope.error = error;
		});

	}

	$scope.currentTab = 'bubblecloud';
	$scope.showTab = function (tabName) {
		$scope.currentTab = tabName;
	}
	$scope.stopAnalysis = function (e) {
		// prevent event
		e.preventDefault();
		$scope.toggle_start = 1;
		$scope.toggle_stop = 0;
		var y = document.getElementById("intervallist")
			y.disabled = false;
		$http({
			url : "/api/resa/stop",
			method : "GET"
		}).success(function (response) {
			$scope.response = response;
		}).error(function (error) {
			$scope.error = error;
		});

	}
	$scope.resetView = function (e) {
		// prevent event
		e.preventDefault();
		watchList = [];
		$scope.entities_number = 0;
		$scope.tweets = [];
		$scope.tweets_number = 0;
		$scope.reset_view = 0;
		$scope.cumulative_sentiment = 0;
		$http({
			url : "/api/resa/reset",
			method : "GET"
		}).success(function (response) {
			$scope.response = response;
		}).error(function (error) {
			$scope.error = error;
		});
		//todo: change based on the selected view
		bubblecloud.clearBubbleView();
		var x = document.getElementById("companylist")
			x.disabled = false;
		bar.createBarChart($scope);
	}
	var getEntityType = function (types) {
		if (!types.length) {
			return 'Misc';
		}
		var tmp,
		out = '';
		_.forEach(types, function (v) {
			tmp = v.split(':');
			if (tmp[1] == 'Place' || tmp[1] == 'Person' || tmp[1] == 'Organisation') {
				out = tmp[1];
			}
		})
		if (out) {
			return out;
		} else {
			return 'Misc';
		}

	}
	var prepareTweetText = function (text, entities) {
		_.forEach(entities, function (e) {
			text = text.replace(e.name, '&nbsp;<span resource="' + e.uri + '" class="r_entity r_' + getEntityType(e.types).toLowerCase() + '" typeOf="' + e.types + '">' + e.name + '</span>&nbsp;');
			updateWatchlist(e);

		});
		return text;
	}

	var fetchSentiment = function (keyword) {
		$http({
			url : "/api/resa/initiateSentiment/" + keyword,
			method : "GET"
		}).success(function (response) {
			var sentiment = response;
			sentiment = sentiment.replace(/^[a-zA-Z]+/, "");
			$scope.cumulative_sentiment = Number(sentiment);

		}).error(function (error) {
			$scope.error = error;
		});

	}
	var updateWatchlist = function (entity) {

		if (entity.name.toLowerCase() != $scope.keyword.toLowerCase()) {
			if (watchList[entity.name] == undefined) {
				watchList[entity.name] = {
					count : 1,
					type : getEntityType(entity.types),
					uri : entity.uri
				};
				$scope.entities_number++;
			} else {
				watchList[entity.name].count++;
			}
			total_entities++;
		}
	}
	var initStreamWebsocket = function ($scope) {
		bar.createBarChart($scope);
		var location = document.location.hostname + ':' + defaultPort + document.location.pathname;
		console.log('connecting to socket', location);
		var socket = new WebSocket('ws://' + location);
		socket.onerror = function (err) {
			console.log(err);
		};
		socket.onopen = function () {
			console.log('connection established!');

		};
		socket.onmessage = function (event) {
			var data = JSON.parse(event.data);
			$scope.$apply(function () {

				data.text = prepareTweetText(data.text, data.entities);
				$scope.tweets.unshift(data);
				$scope.tweets_number++;

				//update d3 graph
				//todo: visualize based on the user selected view
				bubblecloud.visualizeBubble($scope, watchList, total_entities);

				fetchSentiment($scope.keyword);

			});
		};
		socket.onclose = function () {
			$scope.$apply(function () {});
		};
	};
};
