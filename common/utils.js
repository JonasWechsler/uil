var mongo = require('mongodb');
var monk = require('monk');
var db = require('./db');
var users = db.get('users');
module.exports = {};

module.exports.recalcScore = function(user) {
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

module.exports.verifyAdmin = function(id, callback) {
    if(!id || id === undefined) {
        callback(false);
    }
    db.get('admins').findOne({'user':id}, function(err, found) {
        if(err || !found) {
            callback(false);
        } else {
            callback(true);
        }
    });
}