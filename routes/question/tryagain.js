var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../../db');
var commonquestion = require('./commonquestion');
module.exports = function (app) {
    app.all('/tryagain/:id', function (req, res) {
        var questionid = req.url.substring(10);
        var users = db.get('users');
        var questions = db.get('questions');
        users.findOne({
            '_id': req.session.id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                commonquestion.isQuestion(found,'correct',questionid,function(correctIndex) {
                    if (correctIndex !== -1) {
                        questions.findOne({
                            '_id': questionid
                        }, function (err, question) {
                            var choices = question.key;
                            var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                            res.render('question/tryagainquestion', {
                                question:question,
                                title: 'Random Question',
                                prompt: prompt,
                                session: req.session,
                                type: "correct",
                                choices: choices,
                                themeq: found.qtheme,
                                themec: found.ctheme
                            });
                        });
                    } 
                });
                commonquestion.isQuestion(found,'incorrect',questionid,function(incorrectIndex) {
                    if (incorrectIndex !== -1) {
                        questions.findOne({
                            '_id': questionid
                        }, function (err, question) {
                            var choices = found.incorrect[incorrectIndex].choice;
                            var title = "Random Question";
                            var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                            res.render('question/tryagainquestion', {
                                question:question,
                                title: title,
                                prompt: prompt,
                                session: req.session,
                                type: "incorrect",
                                choices: choices,
                                themeq: found.qtheme,
                                themec: found.ctheme
                            });
                        });
                    }
                });
                commonquestion.isQuestion(found,'passed',questionid, function(passedIndex) {
                    if (passedIndex !== -1) {
                        questions.findOne({
                            '_id': questionid
                        }, function (err, question) {
                            var answers = question.ans;
                            var title = "Random Question";
                            var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                            res.render('question/tryagainquestion', {
                                question:question,
                                title: title,
                                prompt: prompt,
                                session: req.session,
                                type: "passed",
                                themeq: found.qtheme,
                                themec: found.ctheme
                            });
                        });
                    }
                });
                commonquestion.isQuestion(found,'corrected',questionid, function(correctedIndex) {
                    if(correctedIndex !== -1) {
                        questions.findOne({ '_id':questionid}, function(err, question){
                        var answers = question.ans;
                            var title = "Random Question";
                            var prompt = 'Test: ' + question['test'] + "\nQuestion: " + question['ques'];
                            var choices = found.corrected[correctedIndex].choice;
                            res.render('question/tryagainquestion', {
                                question:question,
                                title: title,
                                prompt: prompt,
                                session: req.session,
                                type: 'corrected',
                                choices: choices,
                                themeq: found.qtheme,
                                themec: found.ctheme
                            });
                        });
                    } 
                });
            }
        })

    });

    app.all('/tryagaincheck', function (req, res) {
        var qid = req.body.id;
        var questions = db.get('questions');
        var users = db.get('users');
        questions.findOne({
            '_id': qid
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var answer = found.key;
                var userselection = req.body.choice;
                var type = req.body.typer;
                if (!userselection) {
                    res.redirect('/');

                } else if (type === 'correct'||type ==='corrected') {
                    if (userselection === answer) {
                        res.redirect('/');

                    } else {
                        res.redirect('/');

                    }
                } else if (type === 'passed') {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, user) {
                        if (err) {
                            throw err;
                        } else {
                            if (userselection === answer) {
                                var passedarray = user.passed;
                                var index = -1;
                                passedarray.forEach(function (obj, ind) {
                                    if (obj.id === qid) {
                                        index = ind;
                                    }
                                });
                                passedarray.splice(index, 1);
                                var correctarray = user.correct;
                                correctarray.push({
                                    id: qid,
                                    time: Date.now(),
                                    choice: [userselection]
                                });
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'passed': passedarray,
                                        'correct': correctarray,
                                    }
                                });
                                res.redirect('/');

                            } else {
                                var passedarray = user.passed;
                                var index = -1;
                                passedarray.forEach(function (obj, ind) {
                                    if (obj.id === qid) {
                                        index = ind;
                                    }
                                });
                                passedarray.splice(index, 1);
                                var incorrectarray = user.incorrect;
                                incorrectarray.push({
                                    id: qid,
                                    time: Date.now(),
                                    choice: [userselection]
                                });
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'passed': passedarray,
                                        'incorrect': incorrectarray,
                                    }
                                });
                                res.redirect('/');

                            }
                        }
                    });
                }
                //incorrectly answered questions
                else {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, user) {
                        if (err) {
                            throw err;
                        } else {
                            var incorrectarray = user.incorrect;
                            var index = -1;
                            incorrectarray.forEach(function (obj, ind) {
                                if (obj.id === qid) {
                                    index = ind;
                                }
                            })
                            var thing = incorrectarray[index];
                            incorrectarray.splice(index, 1);
                            if (userselection === answer) {
                                correctedarray = user.corrected;
                                correctedarray.push(thing);
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'incorrect': incorrectarray,
                                        'corrected': correctedarray,
                                    }
                                });
                                res.redirect('/');

                            }
                            //question was answered incorrectly again
                            else {
                                thing.choice.push(userselection);
                                incorrectarray.push(thing);
                                users.update({
                                    '_id': req.session.id
                                }, {
                                    $set: {
                                        'incorrect': incorrectarray
                                    }
                                });
                                res.redirect('/');

                            }
                        }
                    });
                }
            }
        });
    });
}