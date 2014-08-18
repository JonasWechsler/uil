
var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../../db');


module.exports = function(app) {
    app.all('/signin', function (req, res) {
        if (req.body.username) {
            var username = req.body.username;
            var password = req.body.password;
            var collection = db.get("users");
            collection.findOne({
                "username": username
            }, function (err, found) {
                if (err) {
                    throw err.$animate
                }
                if (!found) {
                    res.render('authentication/login', {
                        title: 'Login',
                        prompt: 'Input your credentials below!',
                        error: "username",
                        session: req.session
                    });
                } else {
                    var hashed = found['password'];
                    if (passwordHash.verify(password, hashed)) {
                        req.session.id = found["_id"];
                        req.session.user = found["username"];
                        req.session.loggedin = true;
                        res.redirect("/home");
                    } else {
                        res.render('authentication/login', {
                            title: 'Login',
                            prompt: "Input your credentials below!",
                            error: "matching",
                            session: req.session
                        });
                    }
                }
            });
        } else {
            res.render('authentication/login', {
                title: 'Login',
                prompt: 'Input your credentials below!',
                session: req.session
            });
        }
    });

    app.all('/logout', function (req, res) {
        if (req.session === undefined) {
            res.redirect("/");
        } else {
            req.session.destroy;
            req.session.loggedin = null;
            req.session = null;
            res.redirect("/");
        }
    });
}