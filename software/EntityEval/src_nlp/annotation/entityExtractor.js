var mlspotlight = require('./spotlight');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

function annotate( object ) {
    if(!object) return [];
    var resources = object.response.Resource;

    var entities = [];
    var prop = "@surfaceForm";
    if(resources){
        for	(var i = 0; i < resources.length; i++) {
            var obj = resources[i];
            entities.push(obj[prop]);
        }
    }
    return entities;
}

function isEmpty(str) {
    return typeof str == 'string' && !str.trim() || typeof str == 'undefined' || str === null;
}

module.exports = annotate;

var test = require('./entityExtractor');
var input="Erdogan is taking #Turkey's to war Samsung to win an election. This may be the biggest miscalculation of his political career …"
console.log(test(input));

