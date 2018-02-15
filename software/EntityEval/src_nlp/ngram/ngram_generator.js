'use strict';

const fs = require( 'fs' );
var csv = require("fast-csv");

var vector_space = {
    unigrams : [],
    bigrams : []
};

var unigrams = require("./unigrams");

var stream = fs.createReadStream( '../data/train.csv' );
var tokenizer = require( '../common/tokenizer.js' );
var proc = require( '../common/preprocessor.js' );


var csvStream = csv()
    .on("data", function(data){
        var tokens = proc(tokenizer(data[2],data[1])).cleanTokens;

        var uni = vector_space.unigrams;

        for(var i = 0; i < tokens.length;  i++){
            var token = tokens[i].toLowerCase();

            if(!uni.includes(token) && unigrams[token] > 3 && unigrams[token] < 20){
                uni.push(token);
            }
        }

        vector_space.unigrams = uni;

    })
    .on("end", function(){
        //var result = {};
        //for (var property in vector_space) {
        //    if(vector_space[property] < 7 && vector_space[property] > 5){
        //        result[property] = 0;
        //    }
        //}
        fs.writeFileSync( './ngrams.json' , JSON.stringify(vector_space) );
    });
stream.pipe(csvStream);


if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}