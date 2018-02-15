var resa = require("./../src/compendium_classifier.js");
var fs = require("fs");
var csv = require("fast-csv");

var stream = fs.createReadStream("./v4/eval.csv");

const neutral = "neutral";
const positive = "positive";
const negative = "negative";

var total_gold_labeled_neutral = 0;
var total_gold_labeled_positive = 0;
var total_gold_labeled_negative = 0;

var total_predicted_neutral = 0;
var total_predicted_positive = 0;
var total_predicted_negative = 0;

var tp_neutral = 0;
var tp_positive = 0;
var tp_negative = 0;

var rows = 0;

var csvStream = csv()
    .on("data", function(data){
        rows++;
        var sentimentTest = resa.getSentiment(data[2], data[1]);

        if(data[0] == neutral){
            total_gold_labeled_neutral++;
            if(sentimentTest == neutral){
                tp_neutral++;
            }
        }

        if(data[0] == positive){
            total_gold_labeled_positive++;
            if(sentimentTest == positive){
                tp_positive++;
            }
        }

        if(data[0] == negative){
            total_gold_labeled_negative++;
            if(sentimentTest == negative){
                tp_negative++;
            }
        }

        if(sentimentTest == neutral){
            total_predicted_neutral++;
        }

        if(sentimentTest == positive){
            total_predicted_positive++;
        }

        if(sentimentTest == negative){
            total_predicted_negative++;
        }

    })
    .on("end", function(){
        console.log(computeResults());
    });

stream.pipe(csvStream);

function computeResults(){
    var recall_neutral = tp_neutral / total_gold_labeled_neutral;
    var recall_positive = tp_positive / total_gold_labeled_positive;
    var recall_negative = tp_negative / total_gold_labeled_negative;

    var precision_neutral = tp_neutral / total_predicted_neutral;
    var precision_positive = tp_positive / total_predicted_positive;
    var precision_negative = tp_negative / total_predicted_negative;

    var accuracy = (tp_neutral + tp_positive  + tp_negative)/(total_predicted_neutral+total_predicted_negative+total_predicted_positive)

    var strNeutral = "Recall (neutral): "+recall_neutral+" / Precision (neutral): "+precision_neutral+"\n";
    var strPositive = "Recall (positive): "+recall_positive+" / Precision (positive): "+precision_positive+"\n";
    var strNegative = "Recall (negative): "+recall_negative+" / Precision (negative): "+precision_negative+"\n";

    var f1_score_neutral = (2*(precision_neutral * recall_neutral))/(precision_neutral + recall_neutral);
    var f1_score_positive = (2*(precision_positive * recall_positive))/(precision_positive + recall_positive);
    var f1_score_negative = (2*(precision_negative * recall_negative))/(precision_negative + recall_negative);

    var strAcc = "Accuracy : "+accuracy+"\n";
    var total_f1 = "Final F1: "+((f1_score_negative+f1_score_neutral+f1_score_positive)/3)+"\n";

    return strNeutral + strPositive + strNegative + "F1 Neu: "+f1_score_neutral+"\n" + "F1 Pos: "+f1_score_positive+"\n" + "F1 Neg: "+f1_score_negative+"\n" + total_f1 +"\n" + strAcc;
}