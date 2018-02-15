//var classifier = require("./core/classifier");
//var sentiment = require("sentiment");
//
//console.time("test");
//console.log(classifier("I got the new Iphone ;). Samsung sucks and is horrible, the worst. Is the ","iphone"));
//console.timeEnd("test");

//
//var pos = require('pos'), tagger = new pos.Tagger();
//var tokens = "land".split(/\s/g);
//
//console.log(tagger.tag(tokens));

//console.log("@hello ,, land.".replace(/[^\w@#\s]/g, ""));

//console.time("test");
//console.log(classifier("I got the new Iphone however it is not that great",""));
//console.timeEnd("test");

//var str = "Life lessons from the Goldman Sachs Elevator parody twitter account. 10 Business Insider";
//str = str.replace(/([:;.?!-])\s*(?=[A-z])/g, "$1|").split("|");
//console.log(str);

//var nlp = require("nlp_compromise");
//
//console.time("test");
//console.log(nlp.text(" now is,tp").sentences[0].terms);
//console.timeEnd("test");

//console.time("test");
//console.log(sentiment("George Martin, producer of the Beatles, dies aged 90").score);
//console.timeEnd("test");
//

//var pos = require('pos'), tagger = new pos.Tagger();
//var tokens = " are so happy.".replace(/[^\w@#\s]/g, "").split(/\s/g);
//
//console.log(tagger.tag(tokens));

//var sentenceEx = require("./target/contextExtractor");
//console.log(sentenceEx("I'm so happy. this #is a @m #Watch,peter????? @Suther,,, land;. UN Goldman Sachs Bilderberg he says nations are to be destroyed @Watch and that,","@watch."));

//var reg = /(:|;|,|\.|!|\?)\w/g;
//var text = "this is a must Watch;peter Sutherland UN Goldman Sachs Bilderberg he says nations are to be destroyed and that";
//console.log(text.split(reg));


//var StanfordSimpleNLP = require('../stanford-nlp/index');
//
//var stanfordSimpleNLP = new StanfordSimpleNLP.StanfordSimpleNLP();
//stanfordSimpleNLP.loadPipelineSync();
//stanfordSimpleNLP.process('This is so good.', function(err, result) {
//    console.log(result.document.sentences.sentence.dependencies);
//});

//use default endpoints
//var mlspotlight = require('./annotation/spotlight');
//var input="time warner has the worse customer service ever. I will never use them again";
//
//console.time("test");
//mlspotlight.annotate(input,function(output){
//    console.log(output.response);
//});
//console.timeEnd("test");

//var compendium = require('compendium-js');
//
//console.log(compendium.analyse('I got the new Iphone however it is not that great')[0].profile.label);

//var obj = require('./annotationServices/dbpedia.de.js');
//annotationServices[obj.name] = obj;

//var natural = require('natural'),
//    TfIdf = natural.TfIdf,
//    tfidf = new TfIdf();

