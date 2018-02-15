var emoticons = require('../lib/emoticons');

module.exports = function (tokens) {

    var count_score = 0;
    var total_score = 0;
    var max_score = 0;
    var last_score = 0;

    for(var i = 0; i < tokens.length; i++){
        var token = tokens[i];

        if(token in emoticons){
            var value = emoticons[token];
            if(value != undefined){
                if(value > 0){
                    last_score = value;
                    count_score++;
                }
                total_score = total_score + value;
                (value > max_score) ? max_score = value : false;
            }
        }
    }

    return [count_score, total_score, max_score, last_score];
}