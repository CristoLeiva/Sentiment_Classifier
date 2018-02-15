'use strict';

const fs = require( 'fs' );
var csv = require("fast-csv");

var natural = require('natural');

var vector_space = {
    unigrams : [],
    bigrams : []
};

var stream = fs.createReadStream( '../data/train2.csv' );
var tokenizer = require( '../common/tokenizer.js' );
var stopwords = require( '../resources/stopwords.json').stopwords;

var csvStream = csv()
    .on("data", function(data){
        var tokens = tokenizer(data[2],data[1]).fullTokens;

        

        var uni = vector_space.unigrams;

        for(var i = 0; i < tokens.length;  i++){
            var token = tokens[i].token;
            var tag = tokens[i].tag;
            if(tag == '#'){
                continue;

            }

            if(token.match(/\//ig)){
                token = token.split("\/")[0];
            }

            if(token.match(/-/ig)){
                token = token.split("-")[0];
            }

            if(token.match(/\.com/ig)){
                continue;
            }

            var result_token = token.toLowerCase().replace(/[^\w]/g,'');

            if(result_token.match(/http/ig)){
                continue;
            }

            if(stopwords.indexOf(result_token) > -1){
                continue;
            }

            if(tag == '^'){
                result_token = "entity";
            }

            result_token = fixElongatedWord(result_token);
            result_token = natural.PorterStemmer.stem(result_token);

            if(!(uni.indexOf(result_token) > -1)){
                uni.push(result_token);
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
        console.log(natural.PorterStemmer.stem("words"));
        console.log(vector_space.unigrams.length);
        fs.writeFileSync( './unigrams.json' , JSON.stringify(vector_space) );
    });
stream.pipe(csvStream);

function fixElongatedWord(token){
    var resultToken = undefined;
    if(checkElongated(token.toLowerCase())){
        resultToken = token.replace(/(.)\1{2,}/ig, '$1$1');
    }
    return (resultToken) ? resultToken : token;
}

function checkElongated(str) {
    str = str.replace(/\s+/g,'_');
    return /(\S)(\1{2,})/g.test(str);
}