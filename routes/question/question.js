var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');
module.exports = function(app) {
    app.all('/random', function (req, res) {
        var questions = db.get('questions');
        var users = db.get('users');
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
                var correcty = found.correct;
                var incorrecty = found.incorrect;
                var correctedy = found.corrected;
                var scorey = 0;
                scorey+=100*correcty.length;
                scorey-=(20*incorrecty.length);
                for( var i = 0;i<correctedy.length;i++){
                    var longy = correctedy[i].choice.length;
                    if(longy===1){
                        scorey+=70;
                    }
                    else if(longy===2){
                        scorey+=50;
                    }
                    else if(longy===3){
                        scorey+=40;
                    }
                    else{
                        scorey+=30;
                    }
                }
                users.update({
                    '_id': req.session.id
                }, {
                    $set: {
                        'score':scorey
                    }
                });
                console.log('score is updated');

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
                if (JSON.stringify(correct).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if (JSON.stringify(incorrect).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if (JSON.stringify(passed).indexOf(id) > -1) {
                    res.redirect('/tryagain/' + id);
                } else if(JSON.stringify(corrected).indexOf(id) > -1){
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
        }, function (err, found) {
            if (err) {
                throw err;
            } else {
                var answer = found['key'];
                if (choice == answer) {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            var correcty = found.correct;
                            var incorrecty = found.incorrect;
                            var correctedy = found.corrected;
                            var scorey = 0;
                            scorey+=100*correcty.length;
                            scorey-=(20*incorrecty.length);
                            for( var i = 0;i<correctedy.length;i++){
                                var longy = correctedy[i].choice.length;
                                if(longy===1){
                                    scorey+=70;
                                }
                                else if(longy===2){
                                    scorey+=50;
                                }
                                else if(longy===3){
                                    scorey+=40;
                                }
                                else{
                                    scorey+=30;
                                }
                            }
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'score':scorey
                                }
                            });
                            console.log('score is updated');
                            var array = found['correct'];
                            var otherarray = found['questions'];
                            var streak = found.streak;
                            var longeststreak = found.longeststreak;
                            streak++;
                            if (streak > longeststreak) {
                                users.update({'_id': req.session.id}, {$set: {'longeststreak': streak}});
                            }
                            var index = otherarray.map(function (obj, index) {
                                if (obj.id == id) {
                                    return index;
                                }
                            }).filter(isFinite)
                            otherarray.splice(index, 1);
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray,
                                    'streak': streak
                                }
                            });
                            array.push({
                                id: id,
                                time: Date.now(),
                                choice: [choice]
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'correct': array
                                }
                            });
                        }
                    });
                    res.redirect('/random');
                } else if (!choice) {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            var correcty = found.correct;
                            var incorrecty = found.incorrect;
                            var correctedy = found.corrected;
                            var scorey = 0;
                            scorey+=100*correcty.length;
                            scorey-=(20*incorrecty.length);
                            for( var i = 0;i<correctedy.length;i++){
                                var longy = correctedy[i].choice.length;
                                if(longy===1){
                                    scorey+=70;
                                }
                                else if(longy===2){
                                    scorey+=50;
                                }
                                else if(longy===3){
                                    scorey+=40;
                                }
                                else{
                                    scorey+=30;
                                }
                            }
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'score':scorey
                                }
                            });
                            console.log('score is updated');
                            var otherarray = found['questions'];
                            var index = otherarray.map(function (obj, index) {
                                if (obj.id == id) {
                                    return index;
                                }
                            }).filter(isFinite)
                            otherarray.splice(index, 1);
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray
                                }
                            });

                            var array = found['passed'];
                            array.push({
                                id: id,
                                time: Date.now(),
                                choice: [choice]
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'passed': array,
                                }
                            });
                        }
                    });
                    res.redirect('/random');
                } else {
                    users.findOne({
                        '_id': req.session.id
                    }, function (err, found) {
                        if (err) {
                            throw err;
                        } else {
                            var correcty = found.correct;
                            var incorrecty = found.incorrect;
                            var correctedy = found.corrected;
                            var scorey = 0;
                            scorey+=100*correcty.length;
                            scorey-=(20*incorrecty.length);
                            for( var i = 0;i<correctedy.length;i++){
                                var longy = correctedy[i].choice.length;
                                if(longy===1){
                                    scorey+=70;
                                }
                                else if(longy===2){
                                    scorey+=50;
                                }
                                else if(longy===3){
                                    scorey+=40;
                                }
                                else{
                                    scorey+=30;
                                }
                            }
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'score':scorey
                                }
                            });
                            console.log('score is updated');
                            var otherarray = found['questions'];
                            var index = otherarray.map(function (obj, index) {
                                if (obj.id == id) {
                                    return index;
                                }
                            }).filter(isFinite)
                            otherarray.splice(index, 1);
                            var streak = found.streak;
                            streak = 0;
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'questions': otherarray,
                                    'streak': streak
                                }
                            });
                            var array = found['incorrect'];
                            array.push({
                                id: id,
                                time: Date.now(),
                                choice: [choice]
                            });
                            users.update({
                                '_id': req.session.id
                            }, {
                                $set: {
                                    'incorrect': array
                                }
                            });
                        }
                    });
                    res.redirect('/random');
                }
            }
        });
    });

}