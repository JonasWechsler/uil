var config = require('../../config');
var common = {};
common.utils = require('../../common/utils');
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
                common.utils.save(req.files.upload, "./programs", req.files.upload.name, function (err) {
                    if (err) {
                        console.log(err);
                        res.render('programming/programming', {
                            prompt: 'Could not save file',
                            session: req.session
                        });
                    } else {

                        input = "./programs/" + req.files.upload.name;
                        var inputDir = path.dirname(input);
                        var inputFile = path.basename(input);
                        var compile_command = 'javac ' + inputDir + '/' + inputFile;
                        exec(compile_command, function(err, stdout, stderr){
                            if(err) {
                                res.render('programming/programming', {
                                    prompt: 'Could not compile java',
                                    session: req.session
                                });
                            } else{
                              var run_command = 'java -cp ' + inputDir + ' ' + inputFile.substring(0,inputFile.lastIndexOf('.java'));
                              exec(run_command, function(err, stdout, stderr){
                                if (err) {
                                    res.render('programming/programming', {
                                        prompt: 'Could not execute java',
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
                                    })

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