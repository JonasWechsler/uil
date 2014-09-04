var config = require('../../config');
var common = {};
require('colors')
var jsdiff = require('diff');
common.utils = require('../../common/utils');
common.execute = require('../../common/execute');
var path = require('path');
var exec = require('child_process').exec;
var fs = require('fs');
module.exports = function(app) {
    app.get('/programming', function (req, res) {
        common.utils.getProblemList(function(problems) {
            res.render('programming/programming', {
                problems:problems,
                session: req.session
            });
        });
    });

    app.post('/programming', function (req, res) {
        common.utils.getProblemList(function(problems) {
            var problem = req.body.problem;
            var type = 'java';
            var saveName = req.files.upload.name;
            //to ensure the correct file type ending
            var cutoff = saveName.lastIndexOf('.' + type);
            saveName = saveName.substring(0, cutoff === -1? saveName.lastIndexOf("."):cutoff);
            //check against command line injection
            if(!common.utils.testFileName(saveName) || !common.utils.testFileName(problem)) {
                res.render('programming/programming', {
                    problems:problems,
                    prompt: 'Invalid File Name',
                    session:req.session
                });
                return;
            }
            common.utils.save(req.files.upload, "./programs", saveName + "." + type, function (err) {
                if (err) {
                    console.log(err);
                    res.render('programming/programming', {
                        problems:problems,
                        prompt: 'Could not save file',
                        session: req.session
                    });
                } else {

                    input = "./programs/" + saveName + "." + type;
                    var inputDir = path.dirname(input);
                    var inputFile = path.basename(input);
                    common.execute.compile(type, inputDir, inputFile, function(err, stdout, stderr) {
                        if(err) {
                            res.render('programming/programming', {
                                problems:problems,
                                prompt: 'Could not compile' + err,
                                session: req.session
                            });
                            common.execute.remove([input]);
                        } else {
                          common.execute.run(type, inputDir, inputFile, function(err, stdout, stderr){
                            if (err) {
                                res.render('programming/programming', {
                                    problems:problems,
                                    prompt: 'Could not execute' + err,
                                    session: req.session
                                });
                                common.execute.remove([input]);
                            } else {
                                fs.readFile(inputDir + '/' + inputFile, 'utf8', function(err,data) {
                                    if(data) {
                                        common.execute.remove([inputDir + '/' + inputFile, inputDir + '/' + inputFile.substring(0,inputFile.lastIndexOf('.java')) + '.class']);
                                        fs.readFile('./output/' + problem + '.out', 'utf8', function(err, difference) {
                                            var correct = true;
                                            var diff = jsdiff.diffLines(difference, stdout);
                                            diff.forEach(function(part){
                                                correct &= !part.removed && !part.added;
                                            });
                                            console.log(difference + '\n' + stdout);
                                            res.render('programming/programming', {
                                                problems:problems,
                                                isCorrect: correct,
                                                prompt: stdout,
                                                programout: data,
                                                session: req.session
                                            });
                                        });

                                    } else {
                                        res.render('programming/programming', {
                                            problems:problems,
                                            prompt: stdout,
                                            session: req.session
                                        });
                                        common.execute.remove([input]);
                                    }
                                });

                            }
                          });
                        }
                    });
                }
            });
        });
    });
}