

module.exports = function(app) {
    app.post('/upload/programming/submit', function (req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                
                res.redirect('/upload');
            } else {
                res.redirect('/');
            }
        });
    });
    app.post('/upload/programming/edit', function (req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                // saving to /pdf directory
                common.utils.save(req.files.upload, "./pdf", req.files.upload.name, function (err) {
                    if (err) {
                        console.log(err);
                        res.render('upload/written', {
                            session: req.session,
                            title: 'Upload A PDF',
                            prompt: err
                        });
                    } else {

                        // getting from /pdf directory, then parsing to json
                        input = "./pdf/" + req.files.upload.name;
                        var inputDir = path.dirname(input);
                        var inputFile = path.basename(input);
                        var p2j = new p2jcmd();
                        p2j.inputCount = 1;
                        p2j.p2j = new PDF2JSONUtil(inputDir, inputFile, p2j);

                        p2j.p2j.processFile(function () {
                            //parsing the json to questions
                            parseJSON(res, req);
                        });
                        //Ends late due to callbacks

                    }
                });
            } else {
                res.redirect('/');
            }
        });
    });
}