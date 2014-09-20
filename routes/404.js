module.exports = function(app) {
    app.use(function (req, res) {
    	res.status(404);

    	if(req.accepts('html'))
    		res.render('404/404', {url: req.url});
    	else if(req.accepts('json'))
    		res.send({error:'Not found'});
    	else
    		res.type('txt').send('404 - This page does not exist.');
    });
}