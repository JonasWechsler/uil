var monk = require('monk');
var mongo = require('mongodb');
var db = require('../../common/db');

module.exports = function(app) {
    app.get('/search', function (req, res) {
        res.render('search/search', {
            session: req.session
        });
    });

    app.post('/search', function (req, res) {
        var query = req.body.query;
        db.get('questions').find({"text" : {$regex : query}}, function(err, ques) {
            if(err || ques.length === 0) {
                res.render('search/search', {
                    session: req.session,
                    prompt: 'No results',
                    results: ques
                });
            } else {
                res.render('search/search', {
                    session: req.session,
                    prompt: 'Search results:',
                    results: ques
                });
            }
        });

    });

}