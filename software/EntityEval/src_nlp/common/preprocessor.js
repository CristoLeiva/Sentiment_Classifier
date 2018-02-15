
const emoticons = require('../lib/emoticons');

module.exports = function (objTokens) {
    var strTokens = objTokens.tokens.join(' ');
    var negatedTokens = markNegatedTokens(objTokens.fullTokens);
    //console.log(strTokens);
    //console.log(negatedTokens.count);

    var final = {
        countAllCaps: getCountAllCaps(strTokens),
        countElongatedWords: getCountElongatedWords(strTokens),
        countHashTags: getCountHashtags(objTokens.tokens),
        countNegationContext: negatedTokens.count,
        countPosEmoticon: getCountPosEmoticon(objTokens.tokens),
        countNegEmoticon: getCountNegEmoticon(objTokens.tokens),
        countPunctuation: getCountPunctuation(objTokens.tokens),
        hashMarkedTokens: normalizeTokensWithHashTag(negatedTokens.tokens),
        cleanTokens: normalizeTokens(objTokens.tokens),
        tokensForSVM: normalizeTokensForVSM(objTokens.tokens),
        markedTokens: normalizeTokens(negatedTokens.tokens)
    }
    return final;
}

function getCountAllCaps(str){
    var matches = str.match(/\b[A-Z]+\b/g);
    return matches ? matches.length : 0;
}

function getCountElongatedWords(str){
    var isElongated = /\b[A-Za-z]*([a-zA-Z])\1\1[A-Za-z]*\b/g;
    var matches = str.match( isElongated );
    return matches ? matches.length : 0;
}

function getCountHashtags(tokens) {
    var count = 0;
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i].match(/#/g)){
            count++;
        }
    }
    return count;
}

function markNegatedTokens( tokens ) {
    var negationList = ['never','not','none','never','no','lack','nothing','nowhere'];
    var newTokens = [];
    var countNegContext = 0;
    var negatedContext = false;
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i].token;
        var tag = tokens[i].tag;
        if(token in emoticons || tag == 'E' ){
            newTokens.push(token);
            continue;
        }
        if(negationList.indexOf(token.toLowerCase()) > -1){
            if(!negatedContext) countNegContext++;
            negatedContext = true;
            newTokens.push(token);
            continue;
        }else if(!negatedContext){
            newTokens.push(token);
            continue;
        }else{
            if(tag != ','){
                var negToken = token + '_NEG';
                newTokens.push(negToken);
            }else{
                newTokens.push(token);
            }
        }
        if(tag == ',' || i == (tokens.length - 1)){
            negatedContext = false;
        }
    }
    var result = {
        tokens : newTokens,
        count : countNegContext
    }
    return result;
}

function getCountPosEmoticon(tokens){
    var count = 0;
    for(var i = 0; i < tokens.length; i++){
        if(emoticons[tokens[i]] == 1){
            count++;
        }
    }
    return count;
}

function getCountNegEmoticon(tokens){
    var count = 0;
    for(var i = 0; i < tokens.length; i++){
        if(emoticons[tokens[i]] == -1){
            count++;
        }
    }
    return count;
}

function getCountPunctuation(tokens){
    var count = 0;
    for(var i = 0; i < tokens.length; i++){
        if(tokens[i].match(/(!|\?|\?\?|\?!|!!|!\?)/g)){
            count++;
        }
    }
    return count;
}

function normalizeTokens(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token in emoticons){
            newTokens.push(token);
        }else{
            if(token != ' ' && token != ''){
                newTokens.push(token);
            }
        }
    }
    return fixElongatedWords(newTokens);
}

function normalizeTokensForVSM(tokens){
    var newTokens = [];
    for	(i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token in emoticons){
            newTokens.push(token);
        }else{
            if(token != (' ' && 'RT' && 'RT:' && '')){
                newTokens.push(token.replace(/[^\w]/gi, '').toLowerCase());
            }
        }
    }
    return fixElongatedWords(newTokens);
}

function normalizeTokensWithHashTag(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if(token in emoticons){
            newTokens.push(token);
        }else{
            if(token != ' ' && token != ''){
                newTokens.push(token);
            }
        }
    }
    return fixElongatedWords(newTokens);
}

function fixElongatedWords(tokens){
    for(var i = 0; i < tokens.length; i++){
        if(checkElongated(tokens[i].toLowerCase())){
            tokens[i] = tokens[i].replace(/(.)\1{2,}/ig, '$1$1');
        }
    }
    return cleanTokens(tokens);
}

function checkElongated(str) {
    str = str.replace(/\s+/g,'_');
    return /(\S)(\1{2,})/g.test(str);
}

function cleanTokens(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        if(tokens[i] != '' && tokens[i] != ' '){
            newTokens.push(tokens[i])
        }
    }
    return newTokens;
}