'use strict';

var data_generator = require( './data_generator' );
const path = require( 'path' );

var dir = path.normalize( __dirname + '/../data' );

data_generator(dir);

