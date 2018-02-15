var fs = require('fs');

const placeHolderEntity = 'TargetEntity', placeHolderURL = 'anyurl', placeHolderUsername = 'anyusername';
var tweetnlp = require('../util/tweet/tweetnlp');
const replacementes = require('../resources/replacements');

module.exports = function (text, target, entityArray) {
    var tokens = text.split(/\s/g);
    tokens = processReplacement(tokens);
    tokens = replaceTargetEntity(tokens, target);
    tokens = removeURLs(tweetnlp(tokens.join(' ')));
    var sentences  = getSentences(tokens);

    var final = {
        tokens : getArrayTokens(tokens),
        noHashTokens : getArrayNoHashTokens(tokens),
        fullTokens: tokens,
        sentences : sentences,
        tweet : text
    }

    return final;
}

function getArrayNoHashTokens(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i].token;
        var tag = tokens[i].tag;
        if(tag != '#'){
            newTokens.push(token.replace('#',''));
        }
    }
    return newTokens;
}

function getArrayTokens(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i].token;
        newTokens.push(token);
    }
    return newTokens;
}

function removeURLs(tokens){
    var finalTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        var tag = tokens[i].tag;
        var token = tokens[i].token;
        if(token.toLowerCase() == placeHolderEntity.toLowerCase()
            || token.toLowerCase() == "#"+placeHolderEntity.toLowerCase()
            || token.toLowerCase() == "@"+placeHolderEntity.toLowerCase()){
            finalTokens.push(tokens[i]);
        }else
        if(tag != 'U' && tag != 'G' && tag != '$' && tag != '~'){
            finalTokens.push(tokens[i]);
        }
    }
    return finalTokens;
}

function getSentences(tokens){
    var sentences = [];
    var sentence = [];
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i].token;
        var tag = tokens[i].tag;
        if(tag == ',' && token.match(/[^,]/g)){
            sentence.push(tokens[i]);
            sentences.push(sentence);
            sentence = [];
        }else {
            sentence.push(tokens[i]);
        }
        if(i == (tokens.length-1)){
            sentences.push(sentence);
        }
    }
    return sentences;
}

function replaceTargetEntity(tokens,target) {
    var entity = target.replace('@', '').replace('#', '');
    var text = tokens.join(' ');
    var regex = new RegExp(entity,'ig');
    text = text.replace(regex, placeHolderEntity);
    return text.split(/\s/g);
}

function processReplacement(tokens){
    var resultTokens = [];

    for(var i = 0; i < tokens.length; i++){
        var token = tokens[i].toLowerCase().replace(/[^\w\.']/g,'');
        if(token in replacementes){
            resultTokens.push(replacementes[tokens[i]]);
        }else {
            resultTokens.push(tokens[i]);
        }
    }
    var str = resultTokens.join(' ');
    str = str.replace(/'s/g, ' is').replace(/'d/g, ' did').replace(/'ll/g, ' will').replace(/'re/g, ' are');
    return str.split(/\s/g);
}


//var input = "Samsung may offer'd 128GB B^D  ♥ variants Dr. of the Galaxy Note 5; and S6 edge+ for an awesome price http://dlvr.it/BrQxtt  #Android #Tech #News";
//var input = "Samsung may do that. Hello nolan";
//var tokeni = require("./tokenizer");
//var str = tokeni(input, "@samsung");
//console.log(str.sentences);

//var negationList = /never|not|none|never|no|lack|nothing|nowhere/;

//var negationList = ['never','not','none','never','no','lack','nothing','nowhere'];
//var token = "not";
//console.log(negationList.indexOf(token) > -1);
