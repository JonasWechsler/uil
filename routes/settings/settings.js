var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var monk = require('monk');
var mongo = require('mongodb');
var db = require('../../db');

module.exports = function(app) {
    app.get('/settings', function (req, res) {
        res.render('settings/settings', {
            session: req.session
        });
    });

    app.post('/settings', function (req, res) {
        var users = db.get('users');
        var username = req.session.user;
        if (req.body.qchoice !== "Select Theme" && req.body.qchoice) {
            users.update({
                'username': username
            }, {
                $set: {
                    qtheme: req.body.qchoice
                }
            });
            res.render('settings/settings', {
                prompt: "updated",
                session: req.session
            });
        }
        if (req.body.cchoice !== "Select Theme" && req.body.cchoice) {
            users.update({
                'username': username
            }, {
                $set: {
                    ctheme: req.body.cchoice
                }
            });
            res.render('settings/settings', {
                prompt: "updated",
                session: req.session
            });
        }
        if (req.body.pass) {
            var newpass = passwordHash.generate(req.body.newpass);
            if (req.body.newpassc !== req.body.newpass) {
                res.render('settings/settings', {
                    session: req.session,
                    prompt: "New Passwords Don't Match"
                });
            } else {

                users.findOne({
                    "username": username
                }, function (err, found) {
                    if (err) {
                        throw err.$animate
                    }
                    if (!found) {
                        res.render('settings/settings', {
                            prompt: 'Error',
                            session: req.session
                        });
                    } else {
                        var hashed = found['password'];
                        if (passwordHash.verify(req.body.pass, hashed)) {
                            users.update({
                                'username': username
                            }, {
                                $set: {
                                    password: newpass
                                }
                            });
                            res.render('settings/settings', {
                                prompt: "updated",
                                session: req.session,
                            });
                        } else {
                            res.render('settings/settings', {
                                prompt: "Incorrect Password",
                                session: req.session
                            });
                        }
                    }
                });
            }
        }
        if ((req.body.qchoice === "Select Theme") || (req.body.cchoice === "Select Theme")) {
            res.render('settings/settings', {
                prompt: "Select a Theme",
                session: req.session
            });
        }
    });
}