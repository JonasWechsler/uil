var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');
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
                    var hash = crypto.createHash('md5').update(found.email).digest('hex');
                    var correct = found.correct;
                    var incorrect = found.incorrect;
                    var passed = found.passed;
                    var corrected = found.corrected;
                    var score = 0;
                    score+=100*correct.length;
                    score-=(20*incorrect.length);
                    for( var i = 0;i<corrected.length;i++){
                        var long = corrected[i].choice.length;
                        if(long===1){
                            score+=70;
                        }
                        else if(long===2){
                            score+=50;
                        }
                        else if(long===3){
                            score+=40;
                        }
                        else{
                            score+=30;
                        }
                    }
                    users.update({
                        '_id': req.session.id
                    }, {
                        $set: {
                            'score':score
                        }
                    });
                    res.render('userpages/profile', {
                        found: found,
                        session: req.session,
                        hash: hash,
                        score:score
                    });
                }
            });
        } else {
            res.redirect("/");
        }
    });

    app.get('/', function (req, res) {
        if (req.session.user) {
            var username = req.session.user;
            var users = db.get('users');
            users.findOne({
                'username': username
            }, function (err, found) {
                if (err) {
                    throw err;
                } else {
                    var hash = crypto.createHash('md5').update(found.email).digest('hex');
                    console.log(JSON.stringify(found));
                    res.render('userpages/profile', {
                        found: found,
                        session: req.session,
                        hash: hash
                    });
                }
            });
        } else {
            res.render('index', {
                title: 'LASA UIL Training',
                session: req.session
            });
        }
    });

    app.all('/stylepage', function (req, res) {
        res.render('stylepage', {
            session: req.session,
            title: 'Style'
        });
    });

}
