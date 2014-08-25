var monk = require('monk');
var mongo = require('mongodb');
var db = require('../../common/db');

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
}