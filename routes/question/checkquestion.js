var db = require('../../common/db');
var questions = db.get('questions');
var users = db.get('users');
var common = {};
common.question = require('../../common/question');
common.utils = require('../../common/utils');
var passwordHash = require('password-hash');
var Promise = require('promise');

function checkcorrectquestion(userselection,answer) {
    if(userselection === answer) 
        return 'correct';
    else
        return 'incorrect';
}

function checkincorrectquestion(req,res,userselection,answer,user,questionid) {
    var incorrectarray = user.incorrect;
    var index = -1;
    incorrectarray.forEach(function (obj, ind) {
        if (obj.id === questionid) {
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

function checkpassedquestion(req,res,userselection,answer,user,questionid) {
    if (userselection === answer) {
        var passedarray = user.passed;
        var index = -1;
        passedarray.forEach(function (obj, ind) {
            if (obj.id === questionid) {
                index = ind;
            }
        });
        passedarray.splice(index, 1);
        var correctarray = user.correct;
        correctarray.push({
            id: questionid,
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
            if (obj.id === questionid) {
                index = ind;
            }
        });
        passedarray.splice(index, 1);
        var incorrectarray = user.incorrect;
        incorrectarray.push({
            id: questionid,
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

function checkquestion(req,res,question,id,userselection,questions,users) { 
    var answer = question.key;
    if (!userselection) {
        res.send('passed');
    }
    users.findOne({
        '_id':id
    }, function(err,user){
    	//convert ObjectId to string with "" + 
        common.question.isQuestion(user,'correct',"" + question._id).done(function(correctIndex) {
            res.send(checkcorrectquestion(userselection,answer));
        }, function(correctMissing) {
            common.question.isQuestion(user,'corrected',"" + question._id).done(function(correctedIndex) {
               res.send(checkcorrectquestion(userselection,answer));
            },function(correctedMissing) {
                common.question.isQuestion(user,'passed',"" + question._id).done(function(passedIndex) {
                     checkpassedquestion(req,res,userselection,answer,user,"" + question._id);
                },function(passedMissing) {
                   common.question.isQuestion(user,'incorrect',"" + question._id).done(function(incorrectIndex) {
                        checkincorrectquestion(req,res,userselection,answer,user,"" + question._id);
                   }, function(incorrectMissing) {
                        checknewquestion(req,res,"" + question._id,id,userselection,questions,users);
                   });
                })
            });
        })
    })
}

function checknewquestion(req,res,questionid,userid,userselection,questioncollection,usercollection) {
    questioncollection.findOne({
        "_id": questionid
    }, function (err, foundquestion) {
        if (err) {
            throw err;
        } else {
            var answer = foundquestion['key'];
            usercollection.findOne({
            	'_id': userid
            }, function(err, found) {
            	if(err) 
            		throw err;
            	else {
            		if (userselection == answer) {
                        common.utils.recalcScore(found);
                        common.question.placeIntoAnsweredCategory(found, 'correct', questionid, userselection);
		                res.send('correct');
		            } else if (!userselection) {
                        common.utils.recalcScore(found);
                        common.question.placeIntoAnsweredCategory(found, 'passed', questionid, userselection);
		                res.send('passed');
		            } else {
                        common.utils.recalcScore(found);
                        common.question.placeIntoAnsweredCategory(found, 'incorrect', questionid, userselection);
		                res.send('incorrect');
		            }
            	}
            });
            
        }
    });
}
module.exports = function(app) {
    app.all('/checkquestion', function (req, res) {
        var questionid = req.body.id;
        var id = req.session.id;
        var userselection = req.body.choice;
        var questions = db.get('questions');
        var users = db.get('users');
        questions.findOne({
            '_id': questionid
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                checkquestion(req,res,found,id,userselection,questions,users);
            }
        });
    });
}
