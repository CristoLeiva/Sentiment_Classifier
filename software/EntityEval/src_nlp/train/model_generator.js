'use strict';

const fs = require( 'fs' );
const svm = require( 'node-svm' );

function generate(dir__, obj) {

    var data = require(dir__+'/train_data.json');

    var resultset = [];
    for	(var i = 0; i < data.features.length; i++) {
        var temp = [];
        temp.push(data.features[i])
        temp.push(data.sentiments[i]);
        resultset.push(temp);
    }

    var clf = new svm.CSVC({
        kernelType: 'linear',
        probability: false,
        kFold: 4
    });

    clf.train(resultset)
        .spread(function(trainedModel, trainingReport){
            fs.writeFileSync(dir__+'/model.json', JSON.stringify(trainedModel) );
            return(trainingReport);
        })
        .done(function(report){
            console.log(report);
        });
}

module.exports = generate;
