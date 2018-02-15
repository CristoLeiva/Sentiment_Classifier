var fs = require('fs');

const placeHolderEntity = 'targetentity', placeHolderURL = '', placeHolderUsername = 'anyusername';
const emoticons = require('../lib/emoticons');
const replacementes = require('../resources/replacements');
var pos = require('pos'), tagger = new pos.Tagger();

module.exports = function (text, target, targetArray) {
    targetArray = (typeof targetArray === 'undefined') ? 'default' : targetArray;
    if(target == undefined || target == ' ' || target == '' || target == null) target = placeHolderEntity;

    var tokens = text.split(/\s/g);
    tokens = replaceURL(tokens);
    tokens = normalizePunctuation(tokens);
    //tokens = replaceEntity(tokens,target);
    //tokens = replaceMentions(tokens);
    tokens = processReplacements(tokens);
    tokens = replaceEmoji(tokens);
    tokens = cleanTokens(tokens);

    var sentences = getSentences(tokens);

    for	(var i = 0; i < sentences.length; i++) {
        sentences[i] = replaceEntity(cleanTokens(sentences[i].split(/\s/g)),target).join(" ");
        sentences[i] = replaceMentions(cleanTokens(sentences[i].split(/\s/g)),target).join(" ");
    }
    //console.log(sentences);

    sentences = processForTarget(sentences,placeHolderEntity);

    return sentences;
}

function normalizePunctuation(tokens){
    var newTokens = [];
    for	(i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var reg = /(:|;|,|\.|!|\?|-)\w/g;
        if(token.match(reg)){
            while ((match = reg.exec(token)) != null) {
                token = token.insertAt(match.index+1, " ");
            }
            newTokens.push(token);
        }else {
            newTokens.push(token);
        }
    }
    var str = newTokens.join(' ');
    return str.split(/\s/g);
}

function replaceEmoji(tokens){
    var newTokens = [];
    for	(i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token in emoticons){
            if(emoticons[token] == 1){
                newTokens.push(":)");
            }else {
                newTokens.push(":(");
            }
        }else {
            newTokens.push(token);
        }
    }

    return newTokens;
}

function getSentences(tokens){
    var str = tokens.join(" ");

    var sentences = str.replace(/([:;.?!])\s/g, "$1|").split("|");

    return sentences;
}

function processForTarget(sentences, target){

    var contextSentences = [];
    for	(var i = 0; i < sentences.length; i++) {
        var sentence = sentences[i];
        if(hasTarget(sentence, target)){
            if((i-1) >= 0){
                if(!hasTarget(sentences[i-1], target) && !hasNoun(sentences[i-1])){
                    contextSentences.push(sentences[i-1]);
                }
            }
            contextSentences.push(sentence);
            if(i+1 < sentences.length){
                if(!hasTarget(sentences[i+1], target) && !hasNoun(sentences[i+1])){
                    contextSentences.push(sentences[i+1]);
                }
            }
        }
    }
    return contextSentences;
}

function hasTarget(sentence, target){
    var ban = false;
    var tokens = sentence.split(/\s/g);
    for	(i = 0; i < tokens.length; i++) {
        var tempTarg = target.replace(/[^\w]/g, "").toLowerCase();
        var token = tokens[i].replace(/[^\w]/g, "").toLowerCase();
        if(tempTarg == token){
            ban = true;
        }
    }
    return ban;
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

function replaceURL(tokens){
    var urlRegex =/(\b(https?|ftp|file:\/\/|\bwww\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|‌​])|([\S]+\.([a-z]{2,})+?\/[\S]+)/ig;
    var resultTokens = [];
    for(var i = 0; i < tokens.length;  i++){
        resultTokens.push(tokens[i].replace(urlRegex, placeHolderURL));
    }
    return resultTokens;
}

function replaceEntity(tokens, target){
    var resultTokens = [];

    for	(var i = 0; i < tokens.length; i++) {
        var tempTarg = target.replace(/[^\w]/g, "").toLowerCase();
        var token = tokens[i].replace(/[^\w]/g, "").toLowerCase();
        if(tempTarg == token){
            resultTokens.push(placeHolderEntity);
        }else {
            resultTokens.push(tokens[i]);
        }
    }
    return resultTokens;
}

function replaceMentions(tokens){
    var mentionRegex =/@\w+/ig;
    var resultTokens = [];
    for(var i = 0; i < tokens.length;  i++){
        var token = tokens[i];
        if(token.match(mentionRegex)){
            resultTokens.push(placeHolderUsername);
        }else {
            resultTokens.push(token);
        }
    }
    return resultTokens;
}

function processReplacements(tokens){
    var resultTokens = [];

    for(var i = 0; i < tokens.length; i++){
        if(tokens[i].toLowerCase() in replacementes){
            resultTokens.push(replacementes[tokens[i]]);
        }else {
            resultTokens.push(tokens[i]);
        }
    }
    var str = resultTokens.join(' ');
    str = str.replace(/\'s/g, ' is').replace(/\'d/g, ' did').replace(/\'ll/g, ' will').replace(/\'re/g, ' are').replace(/\'m/g, ' am');
    return str.split(/\s/g);
}


String.prototype.insertAt=function(index, string) {
    return this.substr(0, index) + string + this.substr(index);
}

if(!String.prototype.startsWith){
    String.prototype.startsWith = function (str) {
        return !this.indexOf(str);
    }
}



//-----------------------

function normalizeTokens2(tokens){
    var newTokens = [];
    for	(i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token in emoticons){
            newTokens.push(token);
        }else{
            if(token != (' ' && 'RT' && 'RT:' && '') && token.match(/[\w]/ig)){
                newTokens.push(token);
            }
        }
    }
    return newTokens;
}

//------------------TESTING

function processPlaceHolders(_text, _target){
    var entity = _target.replace('@', '').replace('#', '');

    var tokens = _text.split(/\s/g);

    tokens = replaceURL(tokens);
    tokens = replaceEntity(tokens.join(' '),entity);
    tokens = replaceMentions(tokens);

    return tokens;
}

function processForTargetOld(tokens){
    var tempStr = normalizePunctuation(tokens.join(' '));
    var sentences = tempStr.split('|');
    var targetSentences = [];
    for (var i = 0; i < sentences.length; i++) {
        if (sentences[i].contains(placeHolderEntity)) {
            targetSentences.push(sentences[i]);
        }
    }

    return cleanTokens((targetSentences.join(' ')).split(' '));
}

