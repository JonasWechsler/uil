var monk = require('monk');
var mongo = require('mongodb');
var db = require('../../common/db');
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
    	var questions = db.get("questions");
    	questions.find({}, function(err, questions) {
    		questions.sort(questionreportedcompare);
    		if(!err && questions) {
                res.render('report/reported', {
                    questionlist: questions,
                    prompt: 'Reported questions sorted by times reported',
                    session: req.session
                });
    		}
    	});
    });
}