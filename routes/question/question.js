var db = require('../../common/db');
var questions = db.get('questions');
var users = db.get('users');
var common = {};
common.question = require('../../common/question');
common.utils = require('../../common/utils');

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
                common.utils.recalcScore(found);

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
                            common.utils.recalcScore(found);
                            common.question.placeIntoAnsweredCategory(found, 'correct', id, choice);
                        }
                    });
                    res.send('correct');
                } else if (!choice) {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            common.utils.recalcScore(found);
                            common.question.placeIntoAnsweredCategory(found, 'passed', id, choice);
                        }
                    });
                    res.send('passed');
                } else {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            common.utils.recalcScore(found);
                            common.question.placeIntoAnsweredCategory(found, 'incorrect', id, choice);
                        }
                    });
                    res.send('incorrect');
                }
            }
        });
    });

}
