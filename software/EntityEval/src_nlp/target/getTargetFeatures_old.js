var pos = require('pos'), tagger = new pos.Tagger();
var afinn = require('../lib/afinn');

module.exports = function (markedTokens) {

    var but_clause = 0;
    var target_sent_score = 0;

    var ban = false;

    var left_tokens = [];
    var right_tokens = [];
    for(var i = 0; i < markedTokens.length; i++){
        var token = markedTokens[i].replace('_NEG', '');;
        if(token.match(/(although|however|neverthelesss|still|though|but)/ig)){
            but_clause = 1;
            ban = true;
            continue;
        }
        if(!ban){
            left_tokens.push(markedTokens[i]);
        }else {
            right_tokens.push(markedTokens[i]);
        }
    }

    if(left_tokens.includes('targetentity_NEG') || left_tokens.includes('targetentity')){
        target_sent_score = getSentScore(left_tokens);
        if(target_sent_score == 0){
            target_sent_score = (getSentScore(right_tokens) * -1);
        }
    }else {
        target_sent_score = getSentScore(right_tokens);
        if(target_sent_score == 0){
            target_sent_score = (getSentScore(left_tokens) * -1);
        }
    }

    if(but_clause == 0) target_sent_score = 0;

    return [but_clause, target_sent_score];
}

function getSentScore(tokens){
    var total_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var marked = 1;
        var token = tokens[i];
        if(token.contains('_NEG')){
            marked = -1;
            token = token.replace('_NEG', '');
        }
        if(token in afinn){
            var value = afinn[token] * marked;
            total_score = total_score + value;
        }
    }
    return total_score;
}

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