
var mongo = require('mongodb'),
    monk = require('monk'),
    PFParser = require('pdf2json/pdfparser');
var db = require('../../common/db');
var collection = db.get("questions");
var usercollection = db.get("users");
var common = {};
common.utils = require('../../common/utils');

module.exports = function(app) {
    app.get('/upload', function (req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                res.render('upload/upload', {
                    session: req.session,
                    title: 'Upload A PDF',
                    prompt: 'Browse for a PDF'
                });
            } else {
                res.redirect('/');
            }
        });
    });
}
