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
                        users: users
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
}