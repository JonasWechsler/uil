var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../../db');

module.exports = function(app) {
    app.all('/scoreboard', function (req, res) {
        var users = db.get('users');
        var ranking = [];
        users.find({}, function (err, found) {
            if (err) {
                throw err;
            } else {
                for (var i = 0; i < found.length; i++) {
                    ranking.push(found[i]);
                }
                //SORTING ALGORITHM BY SCORE
                if (ranking.length > 1) {
                    ranking.sort(function (first, second) {
                        return second.score - first.score;
                    });
                }
            }
            res.render('statistics/scoreboard', {
                ranking: ranking,
                session: req.session
            });
        });
    });

    app.all('/user/:username', function (req, res) {
        var username = req.url;
        username = username.substring(username.lastIndexOf('/')+1);
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var hash = crypto.createHash('md5').update(found.email).digest('hex');
                res.render('userpages/profile', {
                    found: found,
                    session: req.session,
                    hash: hash
                });
            }
        });
    });

    app.all('/:username/correct', function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                res.render('listpages/listofcorrects', {
                    found: found,
                    session: req.session
                });
            }
        });
    });

    app.all('/:username/incorrect', function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                res.render('listpages/listofincorrects', {
                    found: found,
                    session: req.session,
                });
            }
        });
    });

    app.all('/:username/passed', function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                res.render('listpages/listofpassed', {
                    found: found,
                    session: req.session
                });
            }
        });
    });

    app.all('/:username/corrected', function (req, res) {
        var username = req.url.substring(req.url.indexOf('/') + 1, req.url.lastIndexOf('/'));
        var users = db.get('users');
        users.findOne({
            'username': username
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                res.render('listpages/listofcorrected', {
                    found: found,
                    session: req.session
                });
            }
        });
    });
}