var p2jcmd = require('pdf2json'),
    path = require('path'),
    _ = require('underscore'),
    mongo = require('mongodb'),
    monk = require('monk'),
    PFParser = require('pdf2json/pdfparser'),
    pdf2jsonutil = require('./pdf2jsonutil.js');
var db = require('../../common/db');
var collection = db.get("questions");
var usercollection = db.get("users");
var output;
var input = "";
var json = {
    formImage: {
        Pages: []
    }
};

var common = {};
common.utils = require('../../common/utils');

var parseJSON = function (res, req) {
    console.log("Successfully converted PDF -> JSON");

    res.send(json)
}

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
                //console.log(req.files.upload+" "req.files.upload.name);

                common.utils.save(req.files.upload, "./files/programming/", req.files.upload.name, function (err) {
                    if (err) {
                        console.log(err);
                        res.render('upload/programming', {
                            session: req.session,
                            title: 'Upload A PDF',
                            prompt: err
                        });
                    } else {

                        // getting from /pdf directory, then parsing to json
                        input = "./files/programming/" + req.files.upload.name;
                        var inputDir = path.dirname(input);
                        var inputFile = path.basename(input);
                        var p2j = new p2jcmd();
                        p2j.inputCount = 1;
                        p2j.p2j = new pdf2jsonutil.PDF2JSONUtil(inputDir, inputFile, p2j);

                        p2j.p2j.processFile(function () {
                            //parsing the json to questions
                            json = pdf2jsonutil.getJSON();
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