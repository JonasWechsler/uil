var db = require('../../common/db');
var questions = db.get('questions');
var users = db.get('users');
var common = {};
common.question = require('../../common/question');
common.utils = require('../../common/utils');
var passwordHash = require('password-hash');
var Promise = require('promise');

function tryagain(req,res,user,questionid,questioncollection, usercollection) {
    usercollection.findOne({
        '_id': req.session.id
    }, function (err, found) {
        if (err) {
            throw err;
        } else {
            common.question.isQuestion(found,'correct',questionid).done(function(correctIndex) {
                questioncollection.findOne({
                    '_id': questionid
                }, function (err, question) {
                    var choices = question.key;
                    var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                    res.render('question/renderquestion', {
                        question:question,
                        title: 'Random Question',
                        prompt: prompt,
                        type:'correct',
                        session: req.session,
                        choices: choices,
                        themeq: found.qtheme,
                        themec: found.ctheme
                    });
                });
            }, function(correctMissing) {
                if(correctMissing) {
                    common.question.isQuestion(found,'incorrect',questionid).done(function(incorrectIndex) {
                        if (incorrectIndex !== -1) {
                            questioncollection.findOne({
                                '_id': questionid
                            }, function (err, question) {
                                var choices = found.incorrect[incorrectIndex].choice;
                                var title = "Random Question";
                                var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                                res.render('question/renderquestion', {
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
                    },function(incorrectMissing) {
                        if(incorrectMissing) {
                            common.question.isQuestion(found,'passed',questionid).done(function(passedIndex) {
                                if (passedIndex !== -1) {
                                    questioncollection.findOne({
                                        '_id': questionid
                                    }, function (err, question) {
                                        var answers = question.ans;
                                        var title = "Random Question";
                                        var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                                        res.render('question/renderquestion', {
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
                            },function(passedMissing) {
                                if(passedMissing) {
                                    common.question.isQuestion(found,'corrected',questionid).done(function(correctedIndex) {
                                        if(correctedIndex !== -1) {
                                            questioncollection.findOne({ '_id':questionid}, function(err, question){
                                                var answers = question.ans;
                                                var title = "Random Question";
                                                var prompt = 'Test: ' + question['test'] + "\nQuestion: " + question['ques'];
                                                var choices = found.corrected[correctedIndex].choice;
                                                res.render('question/renderquestion', {
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
                                    },function(correctedMissing) {
                                        if(correctedMissing) {
                                            questioncollection.findOne({ '_id':questionid}, function(err, question) {
                                                var prompt = 'Test: ' + question['test'] + '\nQuestion: ' + question['ques'];
                                                res.render('question/renderquestion', {
                                                    question:question,
                                                    title:'Random Question',
                                                    type:'new',
                                                    choices:[],
                                                    prompt:prompt,
                                                    session:req.session,
                                                    themeq:found.qtheme,
                                                    themec:found.ctheme
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });

        }
    });
}


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
                if ((correct && JSON.stringify(correct).indexOf(id) > -1) ||
                    (incorrect && JSON.stringify(incorrect).indexOf(id) > -1) ||
                    (passed && JSON.stringify(passed).indexOf(id) > -1) ||
                    (corrected && JSON.stringify(corrected).indexOf(id) > -1)) {
                    tryagain(req, res, found, id, collection, users);
                }
                if (JSON.stringify(questions).indexOf(id) > -1) {
                    collection.findOne({
                        '_id': id
                    }, function (err, question) {
                        if (err) {
                            throw err;
                        }  else if (!question) {
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
                                type:'new',
                                title: 'Random Question',
                                prompt: prompt,
                                session: req.session,
                                themeq: found.qtheme,
                                themec: found.ctheme
                            });
                        }
                    });
                }
            }
        });
    });

}
