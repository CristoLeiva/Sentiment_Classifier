var fs = require("fs");
var csv = require("fast-csv");

var stream = fs.createReadStream("./train_r.csv");
var countNeu = 0;
var countPos = 0;
var countNeg = 0;

var train = "";
var eval = "";

var csvStream = csv()
    .on("data", function(data){
        if(data[0] == "neutral"){
            countNeu++;
            if(countNeu < 1001){
                train = train + '"' + data[0] + '","' + data[1] + '","' + data[2] + '"\n';
            }else{
                eval = eval + '"' + data[0] + '","' + data[1] + '","' + data[2] + '"\n';
            }
        }else if(data[0] == "positive"){
            countPos++;
            if(countPos < 1001){
                train = train + '"' + data[0] + '","' + data[1] + '","' + data[2] + '"\n';
            }else{
                eval = eval + '"' + data[0] + '","' + data[1] + '","' + data[2] + '"\n';
            }
        }else {
            countNeg++;
            if(countNeg < 1001){
                train = train + '"' + data[0] + '","' + data[1] + '","' + data[2] + '"\n';
            }else{
                eval = eval + '"' + data[0] + '","' + data[1] + '","' + data[2] + '"\n';
            }
        }
    })
    .on("end", function(){
        console.log("Negative: "+countNeg+"\n");
        console.log("Positive: "+countPos+"\n");
        console.log("Neutral: "+countNeu+"\n");

        fs.writeFile("./train2.csv", train, function(err) {
            if(err) {
                return console.log(err);
            }
        });

        fs.writeFile("./eval.csv", eval, function(err) {
            if(err) {
                return console.log(err);
            }
        });

    });

stream.pipe(csvStream);