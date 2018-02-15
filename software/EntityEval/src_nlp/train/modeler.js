'use strict';

var model_generator = require( './model_generator' );
const path = require( 'path' );

var dir = path.normalize( __dirname + '/../data' );

model_generator(dir);


