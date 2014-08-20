var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var monk = require('monk');
var mongo = require('mongodb');
var db = require('../../db');

module.exports = function(app) {
    app.get('/search', function (req, res) {
        res.render('search/search', {
            session: req.session
        });
    });

    app.post('/search', function (req, res) {
        var testname = req.body.testname;
        var qno = req.body.qno;
        db.get('questions').find({'test' : testname, 'ques' : qno}, function(err, ques) {
            console.log(err);
            console.log('ques');
            console.log(ques);
            if(err || ques.length === 0) {
                console.log(1);
                res.render('search/search', {
                    session: req.session,
                    prompt: 'Could not find question'

                });
            } else {

                console.log(2);
                console.log(ques[0]._id);
                res.redirect('/random/' + ques[0]._id);            
            }
        });

    });

}