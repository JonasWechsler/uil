var db = require('../../common/db');
var async = require('async');
var common = {};
common.utils = require('../../common/utils');
common.execute = require('../../common/execute');

module.exports = function(app) {
	app.all('/test', function(req, res) {

		// Create a dummy array for use with async library
    	var dummies = [];
		for(var i = 0; i < 40; i++) {
		    dummies.push({dummy: 1});
		}

    	var questions = [];
		async.each(dummies, function(dummy, completed) {
			db.get('questions').find({}, function(err, questionresult) {
    			if(err || questionresult.length == 0) {
    				res.redirect('/signin');
    				completed();
    			} else {
    				var random = parseInt(Math.random() * questionresult.length);
    				questions.push(questionresult[random]);
    				completed();
    			}
    		});
		}, function(err) {
    			db.get('users').find({"username":req.session.user}, function(err, users) {
					if(users.length > 0) {
						var user = users[0];
						if(user.testend && (user.testend / 1000) - (new Date().getTime() / 1000) < 2400) {
							// There's a test that's started, so redirect to the amount of time left
							res.render('test/test', {
								session: req.session,
								testend: user.testend, 
								questions: questions,
								themeq: user.themeq,
								themec: user.themec
							});
						} else {
							// No test started, let's create one
							var testend = new Date().getTime() / 1000 + 2400; // 40 minutes after the current time (it's in seconds)
							user.testend = testend;
							db.get('users').update({"username": req.session.user}, user, function(err, count, status) {
								res.render('test/test', {
									session: req.session,
									testend: testend,
									questions: questions,
									themeq: user.themeq,
									themec: user.themec
								});
							});
						}
					} else {
						res.redirect('/');
					}
				});
		});
	});

	app.get('/begintest', function(req, res) {
		db.get('users').find({"username": req.session.user}, function(err, users) {
			// Start a new test by reseting the timer
			if(users.length > 0) {
				var user = users[0];
				user.testend = new Date().getTime() / 1000 + 2400;
				db.get('users').update({"username": req.session.user}, user, function(err, count, status) {
					res.redirect('/test');
				});
			} else {
				res.redirect('/');
			}
		});
    });

}