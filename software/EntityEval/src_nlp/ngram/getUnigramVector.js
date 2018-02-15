const ngrams = require("./ngrams");
//const _ = require( 'lodash' );

module.exports = function (tokens) {

    var array = newFilledArray(ngrams.unigrams.length, 0);

    for(var i = 0; i < tokens.length;  i++){
        var token = tokens[i];
        var index = ngrams.unigrams.indexOf(token);
        if(index != -1){
            array[index] = 1;
        };
    }

    //console.log(_.values(unigrams));
    return array;
}

function newFilledArray(len, val) {
    var rv = new Array(len);
    while (--len >= 0) {
        rv[len] = val;
    }
    return rv;
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        'use strict';
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(arguments[1]) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement ||
                (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}
