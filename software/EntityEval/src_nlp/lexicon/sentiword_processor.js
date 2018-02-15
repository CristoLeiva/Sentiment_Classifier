const wordnet = require('../lib/sentiwordnet');

const adjective = wordnet.adjective;
const verb = wordnet.verb;
const noun = wordnet.noun;
const adverb = wordnet.adverb;

module.exports = function (objTokens, markedTokens) {

    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    var fullTokens = objTokens.fullTokens;

    if(markedTokens.length != objTokens.fullTokens.length){
        console.log(markedTokens);
        console.log(objTokens.tokens);
        console.log(objTokens.tweet);
    }

    for(var i = 0; i < fullTokens.length; i++){
        var marked = 1;
        var token = markedTokens[i].toLowerCase().replace(/_neg/g, '_NEG');
        var tag = fullTokens[i].tag;

        if(!token.match(/[\w]/g)){
            continue;
        }

        if(token.contains('_NEG')){
            marked = -1;
            token = token.replace('_NEG', '');
        }

        var value = getSentiWordnetScore(tag, token) * marked;

        if(value > 0){
            last_score = value;
            count_score++;
        }
        total_score = total_score + value;

        (value > max_score) ? max_score = value : false;
    }

    return [count_score, total_score, max_score, last_score];
}

function getSentiWordnetScore(tag, token){
    var score = 0;
    if (tag == 'N' || tag == '^' || tag == 'S' || tag == 'Z' || tag == 'M') {
        score = noun[token];
    }else
    if (tag == 'R') {
        score = adverb[token];
    }else
    if (tag == 'V') {
        score = verb[token];
    }else
    if (tag == 'A') {
        score = adjective[token];
    }
    return (score==undefined) ? 0 : score;
}

//util methods
String.prototype.contains = function(str) { return this.indexOf(str) != -1; };
