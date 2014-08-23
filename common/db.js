// to have one centralized place for the db
var config = require('../config');
var monk = require('monk');
var mongo = require('mongodb');
module.exports = monk(config.db); 