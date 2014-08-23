var crypto = require('crypto'); //To generate a hash for gravatar
var db = require('../../common/db');
var async = require('async');
var common = {};
common.utils = require('../../common/utils');

var getQuestionsList = function(idlist, callback) {
    var questions = db.get('questions');
    var questionlist = [];
    async.each(idlist, function(id, completed) {
        questions.find({_id : id.id}, function(err, question) {
            question[0].time = id.time;
            questionlist.push.apply(questionlist, question);
            completed();
        });
    }, function(err) {
        callback(questionlist);
    });
}
//allows for sorting for most recently answered qs
var questiontimecompare = function(a, b) {
    var afull = a.time;
    var bfull = b.time;
    if(afull < bfull)
        return -1;
    if(bfull < afull)
        return 1;
    return 0;
}
//I should learn to use the async library better 
//someone plz fix this
var getFirstTen = function(user, callback) {
    getQuestionsList(user.correct.slice(0,11), function(corrects) {
        getQuestionsList(user.incorrect.slice(0,11), function(incorrects) {
            getQuestionsList(user.corrected.slice(0,11), function(correcteds) {
                getQuestionsList(user.passed.slice(0,11), function(passeds) {
                    callback(corrects.sort(questiontimecompare),
                             incorrects.sort(questiontimecompare),
                             correcteds.sort(questiontimecompare),
                             passeds.sort(questiontimecompare));
                });
            });
        });
    });
}

module.exports = function(app) {
    app.all('/home', function (req, res) {
        if (req.session.user) {
            var username = req.session.user;
            var users = db.get('users');
            users.findOne({
                'username': username
            }, function (err, found) {
                if (err) {
                    throw err;
                } else {
                    var founduser = found;
                    var hash = crypto.createHash('md5').update(found.email).digest('hex');
                    common.utils.recalcScore(found);
                    getFirstTen(found, function(corrects, incorrects, correcteds, passeds) {
                        res.render('userpages/profile', {
                            found: founduser,
                            session: req.session,
                            hash: hash,
                            corrects: corrects,
                            incorrects: incorrects,
                            correcteds : correcteds,
                            passeds : passeds
                        });
                    });
                }
            });
        } else {
            res.redirect("/");
        }
    });

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
                getFirstTen(found, function(corrects, incorrects, correcteds, passeds) {
                    res.render('userpages/profile', {
                        found: found,
                        session: req.session,
                        hash: hash,
                        corrects: corrects,
                        incorrects: incorrects,
                        correcteds : correcteds,
                        passeds : passeds
                    });
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
                getQuestionsList(found.correct, function(questions) {
                    res.render('userpages/listof', {
                        questionlist: questions,
                        title: found.username + ' correctly answered ' + found.correct.length,
                        session: req.session
                    });
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
                getQuestionsList(found.incorrect, function(questions) {
                    res.render('userpages/listof', {
                        questionlist: questions,
                        title: found.username + ' incorrectly answered ' + found.incorrect.length,
                        session: req.session
                    });
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
                getQuestionsList(found.corrected, function(questions) {
                    res.render('userpages/listof', {
                        questionlist: questions,
                        title: found.username + ' corrected ' + found.corrected.length,
                        session: req.session
                    });
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
                getQuestionsList(found.passed, function(questions) {
                    res.render('userpages/listof', {
                        questionlist: questions,
                        title: found.username + ' passed ' + found.passed.length,
                        session: req.session
                    });
                });
            }
        });
    });
}