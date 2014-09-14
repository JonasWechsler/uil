var config = {};
config.feedback = {};
config.feedback.email = "lasauiltraining@gmail.com";
config.feedback.password = "jacobstephens";
config.port = process.env.PORT || 3000;
config.db = 'lasauil:lasauil@novus.modulusmongo.net:27017/mogAh5az'; //using real database
// config.db = 'localhost:27017/lasauil'; //using test database

module.exports = config;
