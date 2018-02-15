'use strict';

const fs = require( 'fs' );
var csv = require("fast-csv");
const extractor = require( '../core/feature_extractor' );

function generate(dir__) {

    var sentiments = [];
    var features = [];

    var stream = fs.createReadStream(dir__+'/train.csv');

    var csvStream = csv()
        .on("data", function(data){
            if(data[0]=="neutral"){
                sentiments.push(0);
            }else
            if(data[0]=="positive"){
                sentiments.push(1);
            }else{
                sentiments.push(-1);
            }

            features.push(extractor(data[2],data[1]));

        })
        .on("end", function(){
            var o = {
                features: features,
                sentiments: sentiments
            };
            fs.writeFileSync(dir__+'/train_data.json', JSON.stringify(o) );
            console.log("done data preparation!");
        });
    stream.pipe(csvStream);
}

module.exports = generate;