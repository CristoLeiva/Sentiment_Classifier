'use strict';

const svm = require( 'node-svm' );
const extractor = require( './feature_extractor.js' );
var model = require('../data/model.json'  );
var sentenceEx = require("../target/contextExtractor");
var pos = require('pos'), tagger = new pos.Tagger();
var classifier = svm.restore(model);

function classify( tweet , target, targetarray) {
    if(target == undefined || target == ' ' || target == '' || target == null) target = 'targetentity';
    if(tweet == undefined || tweet == ' ' || tweet == '' || tweet == null) return 0;

    var sentences = sentenceEx(tweet, target, targetarray);
    console.log(sentences);
    var result = processForTarget(sentences);


    return result;
}

function processForTarget(sentences){

    var target = 'targetentity';
    var finalText = "";
    for	(var i = 0; i < sentences.length; i++) {
        if(hasTarget(sentences[i], target) && hasCondition(sentences[i])){
            return processCondition(sentences[i], target);
        }else {
            finalText = finalText + sentences[i] + " ";
        }
    }

    //console.log(finalText);
    var testdata =  extractor(finalText, target, undefined);
    return classifier.predictSync( testdata );

}

//Check for corrections
function processCondition(sentence, target){
    var reg = /(but|although|on the other hands|still|nevertheless|yet|though)/ig;
    var array = sentence.split(reg);

    if(hasTarget(array[0], target)){
        //console.log(array);
        var testdata =  extractor(array[0], target, undefined);
        return classifier.predictSync( testdata );
    }else{
        var testdata =  extractor(array[2], target, undefined);
        return classifier.predictSync( testdata );
    }
}

//Check for corrections
function hasCondition(sentence){
    var reg = /(but|although|on the other hands|still|nevertheless|yet|though)/ig;
    return sentence.match(reg);
}

function hasTarget(sentence, target){
    return sentence.match(target);
}

function hasNoun(sentence){

    sentence = sentence.replace(/[^\w@#\s]/g, "");
    var tokens = cleanTokens(sentence.split(/\s/g));

    var taggetTokens = tagger.tag(tokens);

    for	(var i = 0; i < taggetTokens.length; i++) {
        var temp = taggetTokens[i][1].toUpperCase();
        if (temp.startsWith("NNP")) {
            if(!taggetTokens[i][0].match(/(#)\w/g) && taggetTokens[i][0].toLowerCase() != "i" && taggetTokens[i][0].toLowerCase() != "rt"){
                return true;
            }
        }
    }
    return false;
}

function cleanTokens(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        if(tokens[i] != '' && tokens[i] != 'RT' && tokens[i] != ' '){
            newTokens.push(tokens[i])
        }
    }
    return newTokens;
}

module.exports = classify;

var test = require("./targetClassifier");

console.time("test");
var tweet = " apple is a culprits";
var target = "apple";

console.log(test(tweet, target));
console.timeEnd("test");