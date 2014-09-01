var config = require('../../config');
var common = {};
common.utils = require('../../common/utils');
common.execute = require('../../common/execute');
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');
module.exports = function(app) {
    app.get('/programming', function (req, res) {
        res.render('programming/programming', {
            session: req.session
        });
    });

    app.post('/programming', function (req, res) {
        common.utils.verifyAdmin(req.session.id, function(isAdmin) {
            if(isAdmin) {
                var saveName = req.files.upload.name;
                //to ensure the correct file type ending
                var cutoff = saveName.lastIndexOf('.' + req.body.type);
                saveName = saveName.substring(0, cutoff === -1? saveName.lastIndexOf("."):cutoff);
                //check against command line injection
                if(!(/^[a-zA-Z0-9\.]*$/.test(saveName))) {
                    res.render('programming/programming', {
                        prompt: 'Invalid File Name',
                        session:req.session
                    });
                    return;
                }
                common.utils.save(req.files.upload, "./programs", saveName + "." + req.body.type, function (err) {
                    if (err) {
                        console.log(err);
                        res.render('programming/programming', {
                            prompt: 'Could not save file',
                            session: req.session
                        });
                    } else {

                        input = "./programs/" + saveName + "." + req.body.type;
                        var inputDir = path.dirname(input);
                        var inputFile = path.basename(input);
                        common.execute.compile(req.body.type, inputDir, inputFile, function(err, stdout, stderr) {
                            if(err) {
                                res.render('programming/programming', {
                                    prompt: 'Could not compile' + err,
                                    session: req.session
                                });
                            } else {
                              common.execute.run(req.body.type, inputDir, inputFile, function(err, stdout, stderr){
                                if (err) {
                                    res.render('programming/programming', {
                                        prompt: 'Could not execute' + err,
                                        session: req.session
                                    });
                                } else {
                                    fs.readFile(inputDir + '/' + inputFile, 'utf8', function(err,data) {
                                        if(data) {
                                            res.render('programming/programming', {
                                                prompt: stdout,
                                                programout: data,
                                                session: req.session
                                            });
                                        } else {
                                            res.render('programming/programming', {
                                                prompt: stdout,
                                                session: req.session
                                            });
                                        }
                                    });

                                }
                              });
                            }
                        });
                    }
                });
            } else {
                res.render('programming/programming', {
                    prompt: 'submitting is only allowed for admins', 
                    session: req.session
                });
            }
        });
    });
}