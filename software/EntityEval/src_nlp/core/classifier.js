'use strict';

const svm = require( 'node-svm' );
const extractor = require( './feature_extractor.js' );
var model = require('../data/model.json'  );
var classifier = svm.restore(model);

function classify( tweet , target, entityArray) {
    if(isEmpty(tweet)) return 0;
    if(isEmpty(target)) target = "TargetEntity";
    if(!entityArray || entityArray == null) entityArray = [];

    var testdata =  extractor(tweet, target, target);
    return classifier.predictSync(testdata);
}

function isEmpty(str) {
    return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
}

module.exports = classify;

