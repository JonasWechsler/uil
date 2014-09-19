var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var Promise = require('promise');
var db = require('./db');
var questions = db.get('questions');
var users = db.get('users');
module.exports = {};
module.exports.isQuestion = function(user,type,questionid, callback) {
    return new Promise(function (fulfill,reject) {
        var returnInd = -1;
        user[type].forEach(function (obj, ind) {
        if (obj.id === questionid) {
                returnInd = ind;
            }
        });
        if(returnInd < 0) {
            reject(returnInd);
        } else {
            fulfill(returnInd);
        }
    });
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
    var inctemp = {};
    inctemp['$inc'] = {};
    inctemp['$inc'][category] = 1;
    questions.update({
        '_id': questionid
    }, inctemp);

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
