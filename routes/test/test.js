var db = require('../../common/db');
var async = require('async');
var common = {};
common.utils = require('../../common/utils');
common.execute = require('../../common/execute');

module.exports = function(app) {
	app.all('/test', function(req, res) {
		db.get('users').find({"username":req.session.user}, function(err, users) {
			if(users.length > 0) {
				var user = users[0];
				var testTimeLength = 2400; // 40 minutes in seconds

				// Check if there is a test going on already
				// Three checks:
				// 1) Test questions exist
				// 2) End time of test exists
				// 3) End time of test has not happened yet
				if(user.testquestions && user.testquestions.length > 0 && user.testend && (user.testend / 1000) - (new Date().getTime() / 1000) < 2400) {
					// Go through each id of the saved question and pull the question javascript object
					var questions = [];
					var questionids = user.testquestions;
					async.each(questionids, function(questionid, completed) {
						db.get('questions').find({"_id":questionid}, function(err, result) {
							if(err || result.length == 0) {
								res.redirect('/signin');
								completed();
							} else {
								questions.push(result[0]);
								completed();
							}
						});
					}, function(err) {
						// Render the test
						res.render('test/test', {
							session: req.session,
							testend: user.testend,
							questions: questions.sort(compare),
							themeq: user.themeq,
							themec: user.themec
						});
					});

				} else {
					// Create a dummy array for use with async library
			    	var dummies = [];
					for(var i = 0; i < 40; i++) {
					    dummies.push({dummy: 1});
					}

					var ids = [];

					// Grab random questions and create a test
			    	var questions = [];
					async.each(dummies, function(dummy, completed) {
						db.get('questions').find({}, function(err, questionresult) {
			    			if(err || questionresult.length == 0) {
			    				res.redirect('/signin');
			    				completed();
			    			} else {
			    				var random = parseInt(Math.random() * questionresult.length);
			    				questions.push(questionresult[random]);
			    				ids.push(questionresult[random]._id);
			    				completed();
			    			}
			    		});
					}, function(err) {
						// No test started, let's create one
						var testend = new Date().getTime() / 1000 + 2400; // 40 minutes after the current time (it's in seconds)
						user.testend = testend;
						user.testquestions = ids;
						db.get('users').update({"username": req.session.user}, user, function(err, count, status) {
							res.render('test/test', {
								session: req.session,
								testend: testend,
								questions: questions.sort(compare),
								themeq: user.themeq,
								themec: user.themec
							});
						});
					});
				}
			} else {
				// Redirect to login page
				res.redirect('/');
			}
		});
	});

	function compare(a,b) {
	  if (a._id < b._id)
	     return -1;
	  if (a._id > b._id)
	    return 1;
	  return 0;
	}


	app.get('/begintest', function(req, res) {
		db.get('users').find({"username": req.session.user}, function(err, users) {
			// Start a new test by reseting the timer
			if(users.length > 0) {
				var user = users[0];
				user.testend = new Date().getTime() / 1000 + 2400;
				user.testquestions = [];
				db.get('users').update({"username": req.session.user}, user, function(err, count, status) {
					res.redirect('/test');
				});
			} else {
				res.redirect('/');
			}
		});
    });

}