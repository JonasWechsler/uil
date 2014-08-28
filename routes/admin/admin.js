var db = require('../../common/db');
var async = require('async');
var common = {}
common.utils = require('../../common/utils');
module.exports = function(app) {
	app.all('/admin', function (req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({}, function(err, users) {
                    db.get('admins').find({}, function(err, admins) {
                        var adminNames = [];
                        async.each(admins, function(admin, completed) {
                            db.get('users').find({_id : admin.user}, function(err, users) {
                                adminNames.push(users[0].username);
                                completed();
                            });
                        }, function(err) {
                            console.log(adminNames);
                            res.render('admin/admin', {
                                admin: isAdmin,
                                users: users,
                                admins: adminNames,
                                session: req.session
                            });
                        });
                    });
                });
            } else {
                res.redirect('/');
            }
        });
	});

    app.all('/removeadmin', function(req, res) {
        db.get('users').find({"username": req.body.username}, function(err, users) {
            if(users.length > 0) {
                db.get('admins').remove({
                    "user": users[0]._id
                }, function(err, bear) {
                    db.get('users').find({}, function(err, users) { 
                        res.redirect('/admin');
                    });
                });
            }
        });
        
    });
    app.all('/addadmin', function(req, res) {
        db.get('users').find({"username": req.body.username}, function(err, users) {
            console.log(err);
            if(err) {
                res.redirect('/admin');
            } else {
                if(users.length > 0) {
                    var potato = "" + users[0]._id;
                    db.get('admins').insert({"user":potato}, function(err) {
                        res.redirect('/admin');
                    });
                }
            }
        });
    });

    app.all('/removeuser', function(req, res) {
        db.get('users').remove({
            "username": req.body.username
        }, function(err, bear) {
            if(err) {
                res.redirect('/admin');
            } else {
                db.get('users').find({}, function(err, users) { 
                        res.redirect('/admin');
                });
            }
        });
    });
    app.all('/changeuserscore', function(req, res) {
        db.get('users').find({"username": req.body.username}, function(err, users) {
            if(users.length > 0) {
                users[0].score = Number(req.body.score);
                db.get('users').update({"username":req.body.username}, users[0], function(err, count, status) {
                    res.redirect('/admin');
                });
            }
        });
    });
    app.all('/changeuserstreak', function(req, res) {
        db.get('users').find({"username": req.body.username}, function(err, users) {
            if(users.length > 0) {
                users[0].streak = Number(req.body.score);
                db.get('users').update({"username":req.body.username}, users[0], function(err, count, status) {
                    res.redirect('/admin');
                });
            }
        });
    });
    app.all('/changeuserlongeststreak', function(req, res) {
        db.get('users').find({"username": req.body.username}, function(err, users) {
            if(users.length > 0) {
                users[0].longeststreak = Number(req.body.score);
                db.get('users').update({"username":req.body.username}, users[0], function(err, count, status) {
                    res.redirect('/admin');
                });
            }
        });
    });
}