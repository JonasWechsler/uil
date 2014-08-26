var monk = require('monk');
var mongo = require('mongodb');
var db = require('../../common/db');
var common = {};
common.utils = require('../../common/utils');
//reverse sorting
var questionreportedcompare = function(a, b) {
	var areported = a.reported?a.reported:0;
	var breported = b.reported?b.reported:0;
	if(areported > breported) 
		return -1;
	if(areported < breported)
		return 1;
	return 0;
}

var removenonreported = function(question) {
    return question.reported?question.reported>0:false;
}

module.exports = function(app) {
    app.get('/report/:id', function (req, res) {
    	var id = req.param("id");
    	var questions = db.get("questions");
    	questions.findOne({'_id' : id}, function(err, question) {
    		if(!err && question) {
	    		questions.update({'_id':id}, 
	    			{$set: 
	    				{
	    					reported: (question.reported)?question.reported+1:1
	    				}
	    			}
	    		);
	    	}
    	});
    });

    app.get('/reported', function (req,res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {;
            if(isAdmin) {
             	var questions = db.get("questions");
            	questions.find({}, function(err, questions) {
            		questions.sort(questionreportedcompare);
            		if(!err && questions) {
                        res.render('report/reported', {
                            questionlist: questions.filter(removenonreported),
                            prompt: 'Reported questions sorted by times reported',
                            session: req.session
                        });
            		}
            	});
            } else {
                res.redirect('/');
            }
        });
    });
}