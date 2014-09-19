var db = require('../../common/db');
var questions = db.get('questions');
var users = db.get('users');
var common = {};
common.question = require('../../common/question');
common.utils = require('../../common/utils');
var passwordHash = require('password-hash');
var Promise = require('promise');


function checkquestion(req,res,question,id,userselection,questions,users) { 
    var answer = question.key;
    if (!userselection) {
        res.send('passed');
    }
    var isQuestion = Promise.denodeify(common.question.isQuestion);
    users.findOne({
        '_id':id
    }, function(err,user){
        common.question.isQuestion(user,'correct',qid,function(correctIndex) {
            common.question.isQuestion(user,'corrected',qid,function(correctedIndex) {
                if (correctIndex > -1 || correctedIndex > -1) {
                    if(userselection === answer)
                        res.send('correct');
                    else
                        res.send('incorrect');
                }
            })
        });
        common.question.isQuestion(user,'passed',)
    })

        
    else if (type === 'correct'||type ==='corrected') {
        if (userselection === answer) {
            res.send('correct');

        } else {
            res.send('incorrect');

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
                    res.send('correct');

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
                    res.send('incorrect');

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
                    res.send('correct');

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
                    res.send('incorrect');

                }
            }
        });
    }
}

function checknewquestion(req,res,questionid,userid,userselection,questioncollection,usercollection) {
    questioncollection.findOne({
        "_id": questionid
    }, function (err, foundquestion) {
        if (err) {
            throw err;
        } else {
            var answer = foundquestion['key'];
            if (userselection == answer) {
                usercollection.findOne({
                    '_id': userid
                }, function (err, found) {
                    if (err) {
                        throw err;
                    } else {
                        common.utils.recalcScore(found);
                        common.question.placeIntoAnsweredCategory(found, 'correct', id, choice);
                    }
                });
                res.send('correct');
            } else if (!userselection) {
                usercollection.findOne({
                    '_id': userid
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
                usercollection.findOne({
                    '_id': userid
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
}

function tryagain(req,res,user,questionid,questioncollection, usercollection) {
    usercollection.findOne({
        '_id': req.session.id
    }, function (err, found) {
        if (err) {
            throw err;
        } else {
            common.question.isQuestion(found,'correct',questionid,function(correctIndex) {
                if (correctIndex !== -1) {
                    questioncollection.findOne({
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
            common.question.isQuestion(found,'incorrect',questionid,function(incorrectIndex) {
                if (incorrectIndex !== -1) {
                    questioncollection.findOne({
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
            common.question.isQuestion(found,'passed',questionid, function(passedIndex) {
                if (passedIndex !== -1) {
                    questioncollection.findOne({
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
            common.question.isQuestion(found,'corrected',questionid, function(correctedIndex) {
                if(correctedIndex !== -1) {
                    questioncollection.findOne({ '_id':questionid}, function(err, question){
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
                            res.render('question/tryagainquestion', {
                                questionid: id,
                                question: question,
                                title: 'Random Question',
                                prompt: prompt,
                                session: req.session,
                                themeq: found.qtheme,
                                themec: found.ctheme,
                                type:'new'
                            });
                        }
                    });
                }
            }
        });
    });

/*        if(type === 'new') {
            checknewquestion(req,res,qid,id,userselection,questions,users);
        } else {*/
    app.all('/checkquestion', function (req, res) {
        var type = req.body.typer;
        var qid = req.body.id;
        var id = req.session.id;
        var userselection = req.body.choice;
        var questions = db.get('questions');
        var users = db.get('users');
        questions.findOne({
            '_id': qid
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                checkquestion(req,res,found,id,userselection,questions,users);
            }
        });
    });
    

}
