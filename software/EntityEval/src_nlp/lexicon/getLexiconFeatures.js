var afinn = require('../lib/afinn');
var bingliu = require('../lib/bingliu');
var maxdiff = require('../lib/maxdiff');
var nrc_hashtag = require('../lib/nrc_hashtag_neg');
var nrc_s140 = require('../lib/nrc_s140_neg');
var nrc_emotion = require('../lib/nrc_emotion');

function getNRCEmotion(tokens){
    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var marked = 1;
        var token = tokens[i];
        if(token.contains('_NEG')){
            marked = -1;
            token = token.replace('_NEG', '');
        }
        if(token in nrc_emotion){

            var value = nrc_emotion[token] * marked;
            if(value > 0){
                last_score = value;
                count_score++;
            }
            total_score = total_score + value;
            (value > max_score) ? max_score = value : false;
        }
    }
    return [count_score, total_score, max_score, last_score];
}

function getAfinnFeatures(tokens){
    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var marked = 1;
        var token = tokens[i];
        if(token.contains('_NEG')){
            marked = -1;
            token = token.replace('_NEG', '');
        }
        if(token in afinn){

            var value = afinn[token] * marked;
            if(value > 0){
                last_score = value;
                count_score++;
            }
            total_score = total_score + value;
            (value > max_score) ? max_score = value : false;
        }
    }
    return [count_score, total_score, max_score, last_score];
}

function getBingliuFeatures(tokens){
    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var marked = 1;
        var token = tokens[i];
        if(token.contains('_NEG')){
            marked = -1;
            token = token.replace('_NEG', '');
        }
        if(bingliu.positive.indexOf(token) > -1 || bingliu.negative.indexOf(token) > -1){
            var value = (bingliu.positive.indexOf(token) > -1) ? (1 * marked) : (-1 * marked);
            if(value > 0){
                last_score = value;
                count_score++;
            }
            total_score = total_score + value;
            (value > max_score) ? max_score = value : false;
        }
    }
    return [count_score, total_score, max_score, last_score];
}

function getMaxdiffFeatures(tokens){
    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var token = tokens[i];
        if(token in maxdiff){
            var value = maxdiff[token];
            if(value > 0){
                last_score = value;
                count_score++;
            }
            total_score = total_score + value;
            (value > max_score) ? max_score = value : false;
        }
    }
    return [count_score, total_score, max_score, last_score];
}

function getNRCHashtagFeatures(tokens){
    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var token = tokens[i];
        if(token in nrc_hashtag){
            var value = nrc_hashtag[token];
            if(value > 0){
                last_score = value;
                count_score++;
            }
            total_score = total_score + value;
            (value > max_score) ? max_score = value : false;
        }
    }
    return [count_score, total_score, max_score, last_score];
}

function getNRCS140Features(tokens){
    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var token = tokens[i];
        if(token in nrc_s140){
            var value = nrc_s140[token];
            if(value > 0){
                last_score = value;
                count_score++;
            }
            total_score = total_score + value;
            (value > max_score) ? max_score = value : false;
        }
    }
    return [count_score, total_score, max_score, last_score];
}

module.exports = function (proc) {
    var tokens = proc.markedTokens.join(' ').toLowerCase().replace(/[^\w#_\s]/ig, '').replace(/_neg/g, '_NEG').split(/\s/g);
    var hashTokens = proc.hashMarkedTokens.join(' ').toLowerCase().replace(/[^\w_\s]/ig, '').replace(/_neg/g, '_NEG').split(/\s/g);

    tokens = cleanTokens(tokens);
    hashTokens = cleanTokens(hashTokens);

    var afinn_feature = getAfinnFeatures(tokens);
    var nrc_emotion_feature = getNRCEmotion(tokens);
    var bingliu_feature = getBingliuFeatures(tokens);
    var maxdiff_feature = getMaxdiffFeatures(hashTokens);
    var nrc_hashtag = getNRCHashtagFeatures(hashTokens);
    var nrc_s140 = getNRCS140Features(hashTokens);

    return []
        .concat(afinn_feature)
        .concat(nrc_emotion_feature)
        .concat(bingliu_feature)
        .concat(maxdiff_feature)
        .concat(nrc_hashtag)
        .concat(nrc_s140)
        ;
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

//util methods
String.prototype.contains = function(str) { return this.indexOf(str) != -1; };
