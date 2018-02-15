var fs = require("fs");

var lines = fs.readFileSync('./train.csv').toString().split( '\n' );
lines = shuffle(lines);

var buff = "";

for(var i = 0; i < lines.length; i++){
    buff = buff+lines[i]+'\n';
}

fs.writeFile("./train_r.csv", buff, function(err) {
    if(err) {
        return console.log(err);
    }
});

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}