var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../../db');
var questions = db.get('questions');
var users = db.get('users');
var commonquestion = require('./commonquestion');

module.exports = function(app) {
    app.all('/random', function (req, res) {
        users.findOne({
            '_id': req.session.id
        }, function (err, found) {
            if (err) {
                throw err;
            } else if (!found) {
                res.redirect("/signin");
            } else if (found.questions.length === 0) {
                res.send("No more questions");
            } else {
                commonquestion.recalcScore(found);

                var arrayofquestions = found.questions;

                var temporary = arrayofquestions.shift();
                arrayofquestions.push(temporary);
                users.update({
                    '_id': req.session.id
                }, {
                    $set: {
                        'questions': arrayofquestions
                    }
                });
                var id = found['questions'][0];
                res.redirect('/random/' + id);
            }
        });
    });


    app.all('/random/:id', function (req, res) {
        var id = req.params.id;
        var collection = db.get('questions');
        var users = db.get('users');

        users.findOne({
            '_id': req.session.id
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var questions = found.questions;
                var correct = found.correct;
                var incorrect = found.incorrect
                var passed = found.passed;
                var corrected = found.corrected;
                if (correct && JSON.stringify(correct).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if (incorrect && JSON.stringify(incorrect).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if (passed && JSON.stringify(passed).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if(corrected && JSON.stringify(corrected).indexOf(id) > -1){
                    res.redirect('/tryagain/'+id);
                }
                if (JSON.stringify(questions).indexOf(id) > -1) {
                    collection.findOne({
                        '_id': id
                    }, function (err, question) {
                        if (err) {
                            throw err;
                        } else if (!question) {
                            res.render('error', {
                                title: 'Error',
                                prompt: 'We are having issues with the database. Sorry! \nPlease notify the creators and try again later.',
                                session: req.session
                            });
                        } else {
                            var title = 'Random Question';
                            var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                            var answers = question['ans'];
                            res.render('question/renderquestion', {
                                questionid: id,
                                question: question,
                                title: 'Random Question',
                                prompt: prompt,
                                session: req.session,
                                themeq: found.qtheme,
                                themec: found.ctheme,
                            });
                        }
                    });
                }
            }
        });
    });

    app.all('/checkquestion', function (req, res) {
        var choice = req.body.choice;
        var id = req.body.id;
        var retry = req.body.retry;
        var collection = db.get('questions');
        var users = db.get('users');
        collection.findOne({
            "_id": id
        }, function (err, foundquestion) {
            if (err) {
                throw err;
            } else {
                var answer = foundquestion['key'];
                if (choice == answer) {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            commonquestion.recalcScore(found);
                            commonquestion.placeIntoAnsweredCategory(found, 'correct', id, choice);
                        }
                    });
                    if (retry) {
                        res.redirect('/tryagain/' + id);
                    } else {
                        res.redirect('/random');
                    }
                } else if (!choice) {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            commonquestion.recalcScore(found);
                            commonquestion.placeIntoAnsweredCategory(found, 'passed', id, choice);
                        }
                    });
                    if (retry) {
                        res.redirect('/tryagain/' + id);
                    } else {
                        res.redirect('/random');
                    }
                } else {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            commonquestion.recalcScore(found);
                            commonquestion.placeIntoAnsweredCategory(found, 'incorrect', id, choice);
                        }
                    });
                    if (retry) {
                        res.redirect('/tryagain/' + id);
                    } else {
                        res.redirect('/random');
                    }
                }
            }
        });
    });

}
