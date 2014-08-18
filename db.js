// to have one centralized place for the db

var monk = require('monk');
var mongo = require('mongodb');
module.exports = monk('localhost:27017/lasauil'); //using test database
// module.exports = monk('lasauil:lasauil@novus.modulusmongo.net:27017/mogAh5az'); //using real database