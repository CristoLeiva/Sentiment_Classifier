var sentiment = require('sentiment');

var placeholder = 'entitytarget';

function replaceEntity(text, entity){
    var regex = new RegExp(entity,'ig');
    text = text.replace(regex, ' '+'entitytarget'+' ');
    return text;
}

var getSentiment = function(tweet_test, entity_test){

    var entity = entity_test.replace('@', '').replace('#', '');
    var tweet = replaceEntity(tweet_test,entity);

    if(sentiment(tweet).score == 0) return 'neutral';

    var positive = sentiment(tweet).positive;
    var negative = sentiment(tweet).negative;
    var tokens = sentiment(tweet).tokens;
    var entity_sentiment = 0;
    var entity_index = tokens.indexOf(placeholder);

    var radio = 5;

    function getSearchStart(){
        if ((entity_index - radio) < 0){
            return 0;
        } else {
            return entity_index - radio;
        }
    };

    function getSearchEnd(){
        if ((entity_index + radio) > tokens.length){
            return tokens.length;
        } else {
            return entity_index + radio;
        }
    };

    for (var i = getSearchStart(); i <= getSearchEnd(); i++){
        if(negative.indexOf(tokens[i]) >= 0){
            entity_sentiment--;
        }
        if(positive.indexOf(tokens[i]) >= 0){
            entity_sentiment++;
        }
    }

    if(entity_sentiment < 0){
        return 'negative';
    }else {
        return 'positive';
    }
}

module.exports.getSentiment = getSentiment;
