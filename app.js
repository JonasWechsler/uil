var express = require('express'),
    http = require('http'),
    path = require('path'),
    sass = require('node-sass'),
    mongo = require('mongodb'),
    monk = require('monk'),
    verification = require('./verification.js'),
    config = require('./config');

var app = express();

app.use(express.favicon(__dirname + '/public/favicon/favicon.png'));
// all environments
app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sass.middleware({
    src: path.join(__dirname, 'sass'),
    dest: path.join(__dirname, 'public'),
    debug: true
}));
app.use(express.cookieParser('lasacs'));
app.use(express.cookieSession('lasacs'));

app.use(verification());


app.use(app.router);
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
require('./routes/index')(app);
require('./routes/question/question')(app);
require('./routes/question/checkquestion')(app);
require('./routes/userpages/userpage')(app);
require('./routes/feedback/feedback')(app);
require('./routes/upload/written')(app);
require('./routes/upload/upload')(app);
require('./routes/authentication/newuser')(app);
require('./routes/authentication/login')(app);
require('./routes/settings/settings')(app);
require('./routes/bible/bible')(app);
require('./routes/about/about')(app);
require('./routes/admin/admin')(app);
require('./routes/search/search')(app);
require('./routes/report/report')(app);
require('./routes/test/test')(app);
require('./routes/programming/programming')(app);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
