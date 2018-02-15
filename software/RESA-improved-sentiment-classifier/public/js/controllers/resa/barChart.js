var resa = require('./resa');

exports.createBarChart = function ($scope) { //reference http://www.highcharts.com/demo/dynamic-update

	var interval = $scope.interval;
	var split_interval = interval.split(" ");
	if (split_interval[1] == "Minutes" || split_interval[1] == "Minute")
		interval = split_interval[0] * 60000;
	else
		interval = split_interval[0] * 1000;

	$(function () {
		$(document).ready(function () {
			Highcharts.setOptions({
				global : {
					useUTC : false
				}
			});

			$('#other').highcharts({
				chart : {
					type : 'spline',
					animation : Highcharts.svg, // don't animate in old IE
					marginRight : 10,
					events : {
						load : function () {

							// set up the updating of the chart each second
							var series = this.series[0];

							setInterval(function () {
								var flag = true;
								if ($scope.toggle_stop == 0)
									flag = false; ;
								var x = (new Date()).getTime(), // current time
								y = $scope.cumulative_sentiment;
								series.addPoint([x, y], flag, flag);
							}, interval);

						}

					}

				},
				title : {
					text : 'Live Sentiment data'
				},
				xAxis : {
					type : 'datetime',
					tickPixelInterval : 200
				},
				yAxis : {
					title : {
						text : 'Sentiment (-1 to 1)'
					},
					plotLines : [{
							value : 0,
							width : 1,
							color : '#808080'
						}
					]
				},
				tooltip : {
					formatter : function () {
						return '<b>' + this.series.name + '</b><br/>' +
						Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
						Highcharts.numberFormat(this.y, 2);
					}
				},
				legend : {
					enabled : false
				},
				exporting : {
					enabled : false
				},
				credits : {
					enabled : false
				},

				series : [{
						name : 'Sentiment data',
						data : (function () {
							var data = [],
							time = (new Date()).getTime(),
							i;

							for (i = -19; i <= 0; i += 1) {
								data.push({
									x : time + i * 1000,
									y : $scope.cumulative_sentiment
								});
							}
							return data;
						}
							())
					}
				]
			});
		});
	});
}
