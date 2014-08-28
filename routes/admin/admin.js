var db = require('../../common/db');
var common = {}
common.utils = require('../../common/utils');
module.exports = function(app) {
	app.all('/admin', function (req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({}, function(err, users) { 
                    res.render('admin/admin', {
                        admin: isAdmin,
                        users: users,
                        session: req.session
                    });
                });
            } else {
                res.redirect('/');
            }
        });
	});

    app.all('/removeuser', function(req, res) {
        db.get('users').remove({
            "username": req.body.username
        }, function(err, bear) {
            db.get('users').find({}, function(err, users) { 
                    res.redirect('/admin');
            });
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