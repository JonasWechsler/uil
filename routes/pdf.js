var p2jcmd = require('../node_modules/pdf2json/lib/p2jcmd'),
    path = require('path'),
    _ = require('underscore'),
    fs = require('fs'),
    nodeUtil = require('util'),
    mongo = require('mongodb'),
    monk = require('monk'),
    PFParser = require('../node_modules/pdf2json/pdfparser');
var db = monk('localhost:27017/nodetest1');
var collection = db.get("questions");

var output;
var input = "";
var json = {
    formImage: {
        Pages: []
    }
};


var PDF2JSONUtil = (function () {

    var _continue = function (callback, err) {
        if (err)
            nodeUtil.p2jwarn(err);
        if (_.isFunction(callback))
            callback(err);
    };

    var _writeOneJSON = function (data, callback) {

        json = {
            formImage: data
        };
        this.curProcessor.successCount++;
        _continue.call(this, callback);
        /*fs.writeFile(this.outputPath, pJSON, function(err) {
            if(err) {
                nodeUtil.p2jwarn(this.inputFile + " => " + this.outputFile + " Exception: " + err);
                this.curProcessor.failedCount++;
                _continue.call(this, callback, err);
            } else {
                nodeUtil.p2jinfo(this.inputFile + " => " + this.outputFile + " [" + this.outputDir + "] OK");
                this.curProcessor.successCount++;

                if (_.has(argv, 't')) {//needs to generate fields.json file
                    _generateFieldsTypesFile.call(this, data, callback);
                }
                else {
                    _continue.call(this, callback);
                }
            }
        }.bind(this));
        */
    };

    var _parseOnePDF = function (callback) {
        this.pdfParser = new PFParser();

        this.pdfParser.on("pdfParser_dataReady", function (evtData) {

            if (( !! evtData) && ( !! evtData.data)) {
                _writeOneJSON.call(this, evtData.data, callback);
            } else {
                this.curProcessor.failedCount++;
                _continue.call(this, callback, "Exception: empty parsing result - " + this.inputPath);
            }
        }.bind(this));

        this.pdfParser.on("pdfParser_dataError", function (evtData) {
            this.curProcessor.failedCount++;
            var errMsg = "Exception: " + evtData.data;
            _continue.call(this, callback, errMsg);
        }.bind(this));

        nodeUtil.p2jinfo("Transcoding " + this.inputFile + " to - " + this.outputPath);
        this.pdfParser.loadPDF(this.inputPath, 5); //(_.has(argv, 's') ? 0 : 5));

    };

    // constructor
    var cls = function (inputDir, inputFile, curProcessor) {
        // public, this instance copies
        this.inputDir = path.normalize(inputDir);
        this.inputFile = inputFile;
        this.inputPath = this.inputDir + path.sep + this.inputFile;

        this.outputDir = path.normalize(inputDir);
        this.outputFile = null;
        this.outputPath = null;

        this.pdfParser = null;
        this.curProcessor = curProcessor;
    };

    cls.prototype.destroy = function () {
        this.inputDir = null;
        this.inputFile = null;
        this.inputPath = null;
        this.outputDir = null;
        this.outputPath = null;

        if (this.pdfParser) {
            this.pdfParser.destroy();
        }
        this.pdfParser = null;
        this.curProcessor = null;
    };

    cls.prototype.processFile = function (callback) {
        _parseOnePDF.call(this, callback);
    };
    console.log(json);
    //console.log(cls);
    return cls;
})();


var error = .5;
//Approximate Equals function
var equals = function (one, two) {
    if (Math.abs(two - one) < error) {
        return true;
    } else {
        return false;
    }
};
var parseJSON = function (res) {
    console.log("Successfully converted PDF -> JSON");

    var testn = "";
    /*fs.writeFile("State08.json", JSON.stringify(json), function (err) {
        if (err) {
            console.log(err);
        }
    });*/
    //console.log(JSON.stringify(json));

    var newLines = []; //concatenated lines
    var Verts = []; // vertical lines
    var Horiz = []; // horizontal lines
    var xbnds = []; // x bounds
    var ybnds = []; // y bounds
    var finalrects = []; // final boxes ()
    var questions = []; //question objects

    //find name of test
    var next = false;
    for (var z = 0; z < json.formImage.Pages[0].Texts.length; z++) {
        var text = unescape(json.formImage.Pages[0].Texts[z].R[0].T);
        if (next) {
            testn = text.substring(text.indexOf("(") + 1, text.indexOf(")"));
            next = false;
        }
        if (text.indexOf("Computer Science Competition") !== -1) {
            next = true;
        }
    }

    //add lines together
    var add = 0;
    for (var i = 0; i < json.formImage.Pages.length; i++) {
        var newFills = []; // per page
        var dead = [];
        for (var j = 0; j < json.formImage.Pages[i].Fills.length; j++) {
            var one = json.formImage.Pages[i].Fills[j];
            var cur = one;
            if (dead.indexOf(j) > -1) {
                continue;
            }
            for (var k = j + 1; k < json.formImage.Pages[i].Fills.length; k++) {
                var two = json.formImage.Pages[i].Fills[k];
                //assumptions that I made: 
                //I only need to check below/to the right because k>j
                //object one wont expand in both directions (so like, it cant expand H, then somehow match up with something vertically)
                if (equals(one.x, two.x) && equals(one.w, two.w) && equals((one.y + one.h), two.y)) {
                    cur.h = one.h + two.h + two.y - (one.y + one.h);
                    add++;
                    dead.push(k);
                } else if (equals(one.y, two.y) && equals(one.h, two.h) && equals((one.x + one.w), two.x)) {
                    cur.w = one.w + two.w + two.x - (one.x + one.w);
                    add++;
                    dead.push(k);
                }

            }
            newFills.push(cur);
        }
        newLines.push(newFills);
    }
    //console.log("Finished making newLines. " + add + " lines were added");

    //separating horizontal and vertical lines
    for (var i = 0; i < newLines.length; i++) {
        var curh = [],
            curv = [];
        for (var j = 0; j < newLines[i].length; j++) {
            if (newLines[i][j].w > 0.6 && newLines[i][j].h > 0.6) { // remove big "QUESTION" boxes
                newLines[i].splice(j, 1);
                j--;
            } else if (newLines[i][j].w > newLines[i][j].h) {
                curh.push(newLines[i][j]);
            } else if (newLines[i][j].w < newLines[i][j].h) {
                curv.push(newLines[i][j]);
            }
        }
        Horiz.push(curh);
        Verts.push(curv);
    }

    //make x bounds and y bounds
    for (var pg = 0; pg < newLines.length; pg++) {
        var pgx = [];
        var pgy = [];

        //x bounds - find smallest dist to another line, call it a "box" bound
        for (var h = 0; h < Verts[pg].length - 1; h++) {
            if (Verts[pg][h + 1].x < Verts[pg][h].x) {
                h++;
            }
            var xdiff = Number.MAX_VALUE;
            for (var k = 0; k < Verts[pg].length; k++) { //not necessarily in order right and down
                var x;
                if (Verts[pg][k].x - Verts[pg][h].x < xdiff && Verts[pg][k].x - Verts[pg][h].x > 0) {
                    x = {
                        xi: Verts[pg][h].x,
                        xf: Verts[pg][k].x
                    };
                    xdiff = Verts[pg][k].x - Verts[pg][h].x;
                }
            }
            pgx.push(x);
        }

        //y bounds similarly
        for (var h = 0; h < Horiz[pg].length - 1; h++) {
            var ydiff = Number.MAX_VALUE;
            for (var k = 0; k < Horiz[pg].length; k++) { //not necessarily in order right and down
                var y;
                if (Horiz[pg][k].y - Horiz[pg][h].y < ydiff && Horiz[pg][k].y - Horiz[pg][h].y > 0) {
                    var y = {
                        yi: Horiz[pg][h].y,
                        yf: Horiz[pg][k].y,
                        begin: Horiz[pg][h].x,
                        end: Horiz[pg][k].w + Horiz[pg][k].x
                    };
                    ydiff = Horiz[pg][k].y - Horiz[pg][h].y;
                }
            }
            pgy.push(y);
        }
        xbnds.push(pgx);
        ybnds.push(pgy);
    }

    //making boxes out of bounds and lines
    //this goes through and makes boxes based on the length of the horizontal lines
    for (var i = 0; i < ybnds.length; i++) {
        var pg = [];
        var right = null;
        for (var j = 0; j < ybnds[i].length; j++) {
            var bool = false; // stores if box is a "short" box (only spans half page)
            for (var k = 0; k < xbnds[i].length; k++) {
                if (equals(ybnds[i][j].end, xbnds[i][k].xi)) { // if the right edge of a ybnds equals a new xbnds, the left box is only half the page wide
                    bool = true;
                    if (!right) { // if no right box created, 
                        right = {
                            x: xbnds[i][k].xi,
                            y: ybnds[i][j].yi,
                            w: xbnds[i][k].xf - xbnds[i][k].xi,
                            h: 0,
                            pg: i
                        };
                    }
                }
            }

            if (!bool && right) { //if long and right exists                
                var rect = {
                    x: ybnds[i][j].begin,
                    y: ybnds[i][j].yi,
                    w: right.x - ybnds[i][j].begin,
                    h: ybnds[i][j].yf - ybnds[i][j].yi,
                    pg: i
                };
                pg.push(rect);
                right['h'] = ybnds[i][j].yf - right['y'];
                pg.push(right);
                right = null;
            } else {
                var rect = {
                    x: ybnds[i][j].begin,
                    y: ybnds[i][j].yi,
                    w: ybnds[i][j].end - ybnds[i][j].begin,
                    h: ybnds[i][j].yf - ybnds[i][j].yi,
                    pg: i,
                    text: ""
                };
                pg.push(rect);
            }
        }
        finalrects.push(pg);
    }


    //splitting boxes by Verts
    for (var i = 0; i < finalrects.length; i++) {
        var newlist = [];
        for (var j = 0; j < finalrects[i].length; j++) {
            var rect = finalrects[i][j];
            for (var k = 0; k < Verts[i].length; k++) {
                var vline = Verts[i][k];
                if (vline.x > rect.x + 2 && vline.x < rect.x + rect.w - 2) {
                    if ((vline.y < rect.y || equals(vline.y, rect.y)) && (rect.y + rect.h < vline.y + vline.h || equals(rect.y + rect.h, vline.y + vline.h))) {
                        finalrects[i][j] = {
                            x: rect.x,
                            y: rect.y,
                            w: vline.x - rect.x,
                            h: rect.h,
                            pg: rect.pg,
                            text: ""
                        };
                        var newrect2 = {
                            x: vline.x,
                            y: rect.y,
                            w: rect.x + rect.w - vline.x,
                            h: rect.h,
                            pg: rect.pg,
                            text: ""
                        };
                        newlist.push(newrect2);
                        break;
                    }
                }
            }
        }
        finalrects[i] = finalrects[i].concat(newlist);
    }

    //adding text to finalrect boxes
    for (var i = 0; i < json.formImage.Pages.length; i++) {
        for (var q = 0; q < finalrects[i].length; q++) {
            var box = finalrects[i][q];
            var last = json.formImage.Pages[i].Texts[0].y;
            for (var j = 0; j < json.formImage.Pages[i].Texts.length; j++) {
                var last = json.formImage.Pages[i].Texts[0].y;
                var obj = json.formImage.Pages[i].Texts[j];
                if (obj.x > box.x && obj.x < box.x + box.w && obj.y + .5 > box.y && obj.y + .3 < box.y + box.h) { //if it's in the box or close 
                    if (obj.R[0].T || !(obj.R[0].T === "undefined")) {
                        //console.log(unescape(obj.R[0].T)); //does "undefined" === undefined
                        finalrects[i][q].text += obj.R[0].T;
                    }
                    if (obj.y != last)
                        finalrects[i][q].text += "\n";

                }
            }
        }
    }

    var last = json.formImage.Pages.length - 1;
    var answers = {};
    var regexch = /[A-E]/;
    var notspace = /\S/;
    var next = "";

    //finding answers
    for (var z = 0; z < json.formImage.Pages[last].Texts.length; z++) {
        var text = unescape(json.formImage.Pages[last].Texts[z].R[0].T);
        if (text.search(regexch) === -1) {
            next = text;
            continue;
        }
        text = next + " " + text;
        next = "";
        var num = text.substring(text.search(notspace));
        num = num.substring(0, num.indexOf(" "));
        var letter = text.charAt(text.search(regexch));
        answers[num] = letter;
    }
    //changing text inside boxes into json format for database
    for (var z = 0; z < finalrects.length; z++) {
        var min = 1000;
        var secondColumn = 1000;
        var qpage = [];
        if (Verts[z][0]) {

            //Finding the position of the second column to be used to find code on the side
            for (var q = 0; q < Verts[z].length; q++) {
                if (Verts[z][q].x < min) {
                    min = Verts[z][q].x;
                }

            }
            for (var q = 0; q < Verts[z].length; q++) {
                if (Verts[z][q].x < secondColumn && Verts[z][q].x > min) {
                    secondColumn = Verts[z][q].x;
                }

            }

            var next = "";
            for (var j = 0; j < finalrects[z].length; j++) {
                if (finalrects[z][j].x >= secondColumn) {
                    continue;
                }
                // Pushing Assume boxes (Not questions) to the next question
                if (finalrects[z][j].text.indexOf("Assume") === 0) {
                    next = finalrects[z][j].text;
                    continue;
                }
                var question = {
                    test: testn,
                    ques: 1,
                    tags: [],
                    text: "",
                    code: "",
                    ans: [],
                    key: ""
                };

                //Going through all boxes not in the first column to find code that could match up to the questions
                for (var ot = 0; ot < finalrects[z].length; ot++) {
                    if (equals(finalrects[z][ot].y, finalrects[z][j].y) && ot !== j) {
                        question.code += unescape(finalrects[z][ot].text + " ");
                    } else if (finalrects[z][ot].y < finalrects[z][j].y && finalrects[z][ot].y + finalrects[z][ot].h > finalrects[z][j].y) {
                        question.code += unescape(finalrects[z][ot].text + " ");
                    }
                }
                var itext = unescape(finalrects[z][j].text);

                //Finding Question number need to change if we find new lines differently
                var qloc = itext.indexOf("Q\nUESTION");
                var qno = itext.substring(qloc + 12, qloc + 16);
                question.ques = qno.substring(0, qno.indexOf(" "));

                //Finding the actual question text
                question.text = unescape(next) + " " + itext.substring(qloc + 14 + question.ques.length, itext.lastIndexOf("A. "));

                //finding answers, could be problematic with solutions with "A. " etc. in them
                question.ans.push(itext.substring(itext.lastIndexOf("A. ") + 4, itext.lastIndexOf("B. ")));
                question.ans.push(itext.substring(itext.lastIndexOf("B. ") + 4, itext.lastIndexOf("C. ")));
                question.ans.push(itext.substring(itext.lastIndexOf("C. ") + 4, itext.lastIndexOf("D. ")));
                if (itext.indexOf('E') === -1)
                    question.ans.push(itext.substring(itext.lastIndexOf("D. ") + 4));
                else {
                    question.ans.push(itext.substring(itext.lastIndexOf("D. ") + 4, itext.lastIndexOf("E. ")));
                    question.ans.push(itext.substring(itext.lastIndexOf("E. ") + 4));

                }

                //Removing mysterious undefined, probably from the unescape() of text that might be actual code... Computer science tests...
                var uloc = question.code.indexOf("undefined");
                if (uloc !== -1) {
                    question.code = question.code.substr(uloc + 9);
                }

                //Removing newlines from the answers
                for (var v = 0; v < question.ans.length; v++) {
                    var temp = question.ans[v];
                    while (temp.indexOf('\n') > 0)
                        temp = temp.replace('\n', '');
                    question.ans[v] = temp;
                }
                question.key = answers[question.ques + '.'];
                //console.log(JSON.stringify(question));
                //console.log(qno);
                next = "";
                qpage.push(question);
            }
        }
        questions.push(qpage);
    }



    //rendering to be editable
    output = questions;
    res.render('pdf', {
        title: 'Edit PDF',
        prompt: 'Edit your pdf',
        text: JSON.stringify(output),
        json: output
    });
};

var save = function (file, dirname, filename, callback) {
    fs.exists(path.join(dirname, filename), function (exists) {
        //if (exists) {
        //    callback("File already exists, rename the file");
        //} else {
            fs.readFile(file.path, function (err, data) {
                if (err) callback(err)
                else {
                    fs.writeFile(path.join(dirname, filename), data, function (err) {
                        if (err) callback(err);
                        else callback(err, file);
                    });
                }
            });
        //}
    });
}

exports.upload = function (req, res) {
    res.render('pdf', {
        title: 'Upload A PDF',
        prompt: 'Browse for a PDF'
    });
}
exports.submit = function (req, res) {
    //taking edited questions and adding to database
    var input = req.body.in;
    //console.log(input);    
    var obj = JSON.parse(input);
    //collection.insert(obj.list);
    //console.log(obj.list);
    res.send(JSON.stringify(obj));
    for(var i = 0; i<obj.list.length; i++){
        collection.insert(JSON.parse(obj.list[i]));
    }
    /*input = JSON.parse(input);
    for (var r = 0; r < input.length; r++) {
        collection.insert(input[r]);
    }
    res.send(input);*/

}
exports.index = function (req, res) {
    console.log(req.files.upload);
    
    // saving to /pdf directory
    save(req.files.upload, "./pdf", req.files.upload.name, function (err) {
        if (err) {
            console.log(err);
            res.render('pdf', {
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
            //p2j.p2j.processFile(_.bind(p2j.complete, p2j));


            p2j.p2j.processFile(function () {
                //parsing the json to questions
                parseJSON(res);
            });
            //Might not end...

        }
    });

}