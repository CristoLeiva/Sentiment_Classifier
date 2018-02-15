var tokenizer = require("../common/tokenizer");
var preprocessor_class = require("../common/preprocessor");
var pos_tagger = require("../common/pos_tagger");

var lexicon_features = require("../lexicon/getLexiconFeatures");
var sentiword_proc = require('../lexicon/sentiword_processor');
var mpqa_proc = require('../lexicon/mpqa_processor');
var emoticon_proc = require('../lexicon/emoticon_processor');

var ngrams = require('../ngram/getUnigramVector');
var targetObjTokens = require('../target/getTargetFeatures');
var sentenceEx = require("../target/contextExtractor");


module.exports = function (tweet, target, entityArray) {
    if(isEmpty(target)) target = undefined;
    if(!entityArray || entityArray == null) entityArray = [];

    var objTokens = tokenizer(tweet, target, entityArray);
    var preprocesor = preprocessor_class(objTokens);

    var tagger = pos_tagger(objTokens);

    var target_obj_tokens = targetObjTokens(objTokens);
    var targetProcessor = preprocessor_class(target_obj_tokens);

    if(target){
        var sentiword_scores = sentiword_proc(target_obj_tokens, targetProcessor.markedTokens);
        var mpqa_scores = mpqa_proc(target_obj_tokens, targetProcessor.markedTokens);
        var emoticon_scores = emoticon_proc(target_obj_tokens.tokens);
        var lexicon_scores = lexicon_features(targetProcessor);
        var unigrams = target_obj_tokens.tokens;
    }else {
        var sentiword_scores = sentiword_proc(objTokens, preprocesor.markedTokens);
        var mpqa_scores = mpqa_proc(objTokens, preprocesor.markedTokens);
        var emoticon_scores = emoticon_proc(objTokens.tokens);
        var lexicon_scores = lexicon_features(preprocesor);
        var unigrams = objTokens.tokens;
    }

    var punctuationFeatures = getPunctuationFeatures(preprocesor);
    var posFeatures = getPOSFeatures(tagger);



    var lexiconFeatures = []
        .concat(lexicon_scores)
        //.concat(sentiword_scores)
        .concat(mpqa_scores)
        .concat(emoticon_scores)
        ;

    var final_vector = []
        .concat(lexiconFeatures)
        .concat(punctuationFeatures)
        .concat(posFeatures)


        //.concat(targetFeatures)
        //.concat(unigramFeatures)
        ;

    return final_vector;
}

function getPunctuationFeatures(preprocesor){
    var countAllCaps = preprocesor.countAllCaps;
    var countElongatedWords = preprocesor.countElongatedWords;
    var countHashTags = preprocesor.countHashTags;
    var countNegationContext = preprocesor.countNegationContext;
    var countPosEmoticon = preprocesor.countPosEmoticon;
    var countNegEmoticon = preprocesor.countNegEmoticon;
    var countPunctuation = preprocesor.countPunctuation;

    var resultVector = []
        .concat(countAllCaps)
        .concat(countElongatedWords)
        //.concat(countHashTags)
        //.concat(countNegationContext)
        .concat(countPosEmoticon)
        .concat(countNegEmoticon)
        .concat(countPunctuation)
        ;

    return resultVector;
}

function getPOSFeatures(tagger){
    var countAdjectives = tagger.countAdjectives;
    var countNouns = tagger.countNouns;
    var countAdverbs = tagger.countAdverbs;
    var countVerbs = tagger.countVerbs;

    var resultVector = []
        .concat(countAdjectives)
        .concat(countAdverbs)
        .concat(countNouns)
        .concat(countVerbs)
        ;

    return resultVector;
}

function isEmpty(str) {
    return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
}
