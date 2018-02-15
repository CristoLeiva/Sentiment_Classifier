"use strict"
var java = require('java');
java.classpath.push(__dirname+'/lib/ark.jar');
var Twokenize = java.import('cmu.arktweetnlp.Twokenize');
var Sentence = java.import('cmu.arktweetnlp.impl.Sentence');
var ModelSentence = java.import('cmu.arktweetnlp.impl.ModelSentence');
var FeatureExtractor = java.import('cmu.arktweetnlp.impl.features.FeatureExtractor');
var Model = java.import('cmu.arktweetnlp.impl.Model');

var modal = __dirname+'/modal';
var model =  Model.loadModelFromTextSync(modal);
var featureExtractor = new FeatureExtractor(model, false);

var runTagger = function(tweet) {
    var tokens = Twokenize.tokenizeRawTweetTextSync(tweet);
    var sentence = new Sentence();
    sentence.tokens = tokens;
    var modelSentence = new ModelSentence(sentence.TSync());
    featureExtractor.computeFeaturesSync(sentence, modelSentence);
    model.greedyDecodeSync(modelSentence, true);
    var taggedTokens = [];
    for (var i = 0; i < sentence.TSync(); i++) {
        var token = tokens.getSync(i);
        var tag = model.labelVocab.nameSync(modelSentence.labels[i]);
        var confidence = modelSentence.confidences[i];
        taggedTokens.push({token: token, tag: tag, confidence: confidence})
    }
    return taggedTokens;
};
module.exports=runTagger;

//var tweetnlp = require("./tweetnlp");
//var tweet = "Why is #Google; advertising Adwords Express on #Bing? Hmmm, I know Ballmer is happy :-D. #Google, your already a monopoly.";
//console.log(tweetnlp(tweet));


