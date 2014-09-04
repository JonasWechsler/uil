var mongo = require('mongodb');
var monk = require('monk');
var db = require('./db');
var users = db.get('users');
var fs = require('fs');
var path = require('path');
module.exports = {};
module.exports.testFileName = function(name) {
    if(!(/^[a-zA-Z0-9\.]*$/.test(name))) {
        return false;
    }
    return true;
}

module.exports.getProblemList = function(callback) {
    /* 
     * this should be replaced with an actual way 
     * to get the problems list later on
     */ 
    var problems = [];
    problems.push('test');
    callback(problems);
}

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

module.exports.save = function (file, dirname, filename, callback) {
    fs.exists(path.join(dirname, filename), function (exists) {
        fs.readFile(file.path, function (err, data) {
            if (err) callback(err)
            else {
                fs.writeFile(path.join(dirname, filename), data, function (err) {
                    if (err) callback(err);
                    else callback(err, file);
                });
            }
        });
    });
}
