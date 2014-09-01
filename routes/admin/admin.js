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

    app.post('/removeadmin', function(req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({"username": req.body.username}, function(err, users) {
                    if(users.length > 0) {
                        var potato = "" + users[0]._id;
                        db.get('admins').remove({
                            "user": potato
                        }, function(err) {
                            res.redirect('/admin');
                        });
                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
    app.post('/addadmin', function(req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({"username": req.body.username}, function(err, users) {
                    if(err) {
                        res.redirect('/admin');
                    } else {
                        if(users.length > 0) {
                            var potato = "" + users[0]._id;
                            db.get('admins').find({"user":potato}, function(err, admins) {
                                if(admins.length == 0) {
                                    db.get('admins').insert({"user":potato}, function(err) {
                                        res.redirect('/admin');
                                    });
                                } else {
                                    res.redirect('/admin');
                                }
                            })
                        }
                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
    app.post('/removeuser', function(req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({"username":req.body.username}, function(err, users) {
                    if(users.length > 0) {
                        var potato = "" + users[0]._id;
                        db.get('users').remove({"username":req.body.username}, function(err) {
                            if(err) {
                                res.redirect('/admin');
                            } else {
                                db.get('admins').remove({"user":potato}, function(err) {
                                    res.redirect('/admin');
                                });
                            }
                        });
                    } else {
                        res.redirect('/admin');
                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
    app.post('/changeuserscore', function(req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({"username": req.body.username}, function(err, users) {
                    if(users.length > 0) {
                        users[0].score = Number(req.body.score);
                        db.get('users').update({"username":req.body.username}, users[0], function(err, count, status) {
                            res.redirect('/admin');
                        });
                    } else {
                        res.redirect('/admin');
                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
    app.post('/changeuserstreak', function(req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({"username": req.body.username}, function(err, users) {
                    if(users.length > 0) {
                        users[0].streak = Number(req.body.score);
                        db.get('users').update({"username":req.body.username}, users[0], function(err, count, status) {
                            res.redirect('/admin');
                        });
                    } else {
                        res.redirect('/admin');
                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
    app.post('/changeuserlongeststreak', function(req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                db.get('users').find({"username": req.body.username}, function(err, users) {
                    if(users.length > 0) {
                        users[0].longeststreak = Number(req.body.score);
                        db.get('users').update({"username":req.body.username}, users[0], function(err, count, status) {
                            res.redirect('/admin');
                        });
                    } else {
                        res.redirect('/admin');
                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
}