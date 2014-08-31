var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var db = require('../common/db');
module.exports = function(app) {
    app.get('/', function (req, res) {
        res.render('index', {
            title: 'LASA UIL Training',
            session: req.session
        });
    });
    app.all('/stylepage', function (req, res) {
        res.render('stylepage', {
            session: req.session,
            title: 'Style'
        });
    });
    app.get('/hack', function (req, res) {
        res.render('hack', {
            title: 'Hack it!'
        });
    });
}
