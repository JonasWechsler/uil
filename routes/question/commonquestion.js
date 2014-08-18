var passwordHash = require('password-hash');
var crypto = require('crypto'); //To generate a hash for gravatar
var mongo = require('mongodb');
var monk = require('monk');
var db = require('../../db');
var questions = db.get('questions');
var users = db.get('users');
var commonquestion = {};

commonquestion.isQuestion = function(user,type,questionid, callback) {
	user[type].forEach(function (obj, ind) {
        if (obj.id === questionid) {
            callback(ind);
        }
    });
    callback(-1);
}

commonquestion.addToStreak = function(user) {
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

commonquestion.placeIntoAnsweredCategory = function(user, category, questionid, userchoice) {
	var category = category;
    var arrayofcategory = user[category] || [];
    var otherarray = user['questions'];
    if(category === 'correct') {
        commonquestion.addToStreak(user);
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


commonquestion.recalcScore = function(user) {
    var correcty = user.correct || [];
    var incorrecty = user.incorrect || [];
    var correctedy = user.corrected || [];
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
        '_id': user._id
    }, {
        $set: {
            'score':scorey
        }
    });
}

module.exports = commonquestion;