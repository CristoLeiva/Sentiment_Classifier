var compendium = require('compendium-js');

var getSentiment = function(tweet_test){

    var ress = compendium.analyse(tweet_test)[0].profile.sentiment;
    if(ress < 0){
        ress = "negative";
    }else if(ress > 0){
        ress = "positive";
    }else {
        ress = "neutral"
    }
    return ress;
}

module.exports.getSentiment = getSentiment;
