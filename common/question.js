var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('./db');
var questions = db.get('questions');
var users = db.get('users');
module.exports = {};
module.exports.isQuestion = function(user,type,questionid, callback) {
   var returnInd = -1;
   user[type].forEach(function (obj, ind) {
	if (obj.id === questionid) {
            returnInd = ind;
        }
    });
    callback(returnInd);
}

module.exports.addToStreak = function(user) {
    var streak = user.streak + 1;
    var longeststreak = user.longeststreak;
    if (streak > longeststreak) {
        users.update({
	        	'_id': user._id
	        }, {
	        	$set: {
	        		'longeststreak': streak
	        	}
	    	});
    }
    users.update({
    	'_id': user._id
    }, {
        $set: {
        	'streak' : streak
        }
    });
}

module.exports.placeIntoAnsweredCategory = function(user, category, questionid, userchoice) {
	var category = category;
    var arrayofcategory = user[category] || [];
    var otherarray = user['questions'];
    if(category === 'correct') {
        module.exports.addToStreak(user);
    }
    var index = otherarray.map(function (obj, index) {
        if (obj.id == questionid) {
            return index;
        }
    }).filter(isFinite)
    otherarray.splice(index, 1);
    users.update({
        '_id': user._id
    }, {
        $set: {
            'questions': otherarray,
        }
    });
    arrayofcategory.push({
        id: questionid,
        time: Date.now(),
        choice: [userchoice]
    });
    var toUpdate = {};
    toUpdate['$set'] = {};
    toUpdate['$set'][category] = arrayofcategory;
    users.update({
        '_id': user._id
    }, toUpdate);
}
