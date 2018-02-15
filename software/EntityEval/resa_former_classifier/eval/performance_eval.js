var fs = require("fs");
var csv = require("fast-csv");
var resa = require("./../src/resa_classifier.js");
var lines = fs.readFileSync('./performance_data.txt').toString().split( '\n' );

console.time("test");
for(var i = 0; i < lines.length; i++){
    var tweet =  lines[i].split(";")[2];
    resa.getSentiment(tweet, "dd");
    //console.log(resa.getSentiment(tweet));
}
console.timeEnd("test");

