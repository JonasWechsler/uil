var db = require('../../common/db');
module.exports = function(app) {
	app.all('/admin', function (req, res) {
		if (req.session.loggedin) {
            var username = req.session.user;
            var users = db.get('users');
            users.findOne({
            	'username':username
            }, function(err, user) {
            	var userId = user._id;
            	console.log(userId);
            	var admins = db.get('admins');
            	admins.findOne({
            		'user':String(userId)
            	}, function (err, found) {
                	if (err) {
                    	throw err;
                	} else if (found) {
                    	res.render('admin/admin', {
                    		admin: "YOU ARE ADMIN"
                    	});
                	} else {
                		res.render('admin/admin', {
                    		admin: "LOSER YOU ARE NOT ADMIN"
                    	});
                    }
                });
            });
        } else {
            res.render('index', {
                title: 'LASA UIL Training',
                session: req.session
            });
		}
	});
}