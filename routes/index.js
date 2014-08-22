var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../db');
module.exports = function(app) {
    app.get('/', function (req, res) {
        if (req.session.loggedin) {
            var username = req.session.user;
            var users = db.get('users');
            users.findOne({
                'username': username
            }, function (err, found) {
                if (err) {
                    throw err;
                } else if (found) {
                    res.redirect('/home');
                } else {
                    res.render('index', {
                        session: req.session
                    })
                }
            });
        } else {
            res.render('index', {
                title: 'LASA UIL Training',
                session: req.session
            });
        }
    });

    app.all('/stylepage', function (req, res) {
        res.render('stylepage', {
            session: req.session,
            title: 'Style'
        });
    });

}
