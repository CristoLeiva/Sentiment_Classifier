var pos = require('pos'), tagger = new pos.Tagger();
var afinn = require('../lib/afinn');

module.exports = function (objTokens) {
    var sentences = objTokens.sentences;
    var resultTokens = [];

    var resultObjTokens = objTokens;


    for(var i = 0; i < sentences.length; i++){
        var hasTarget = false;
        var hasEntity = false;

        for(var j = 0; j < sentences[i].length; j++){
            var token = sentences[i][j].token;
            var tag = sentences[i][j].tag;

            if(tag == '^'){
                hasEntity = true;
            }
            if(token.match(/targetentity/ig)){
                hasTarget = true;
            }
        }
        if(hasTarget){
            resultTokens = resultTokens.concat(sentences[i]);
        }else if (!hasEntity){
            resultTokens = resultTokens.concat(sentences[i]);
        }
    }

    resultObjTokens.fullTokens = resultTokens;
    resultObjTokens.tokens = getArrayTokens(resultTokens);

    return resultObjTokens;
}

function getArrayTokens(tokens){
    var newTokens = [];
    for	(var i = 0; i < tokens.length; i++) {
        var token = tokens[i].token;
        newTokens.push(token);
    }
    return newTokens;
}