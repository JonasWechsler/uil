var PFParser = require('pdf2json/pdfparser'),
    path = require('path')
    nodeUtil = require('util'),
    _ = require('underscore');

var json = {
    formImage: {
        Pages: []
    }
};

module.exports.getJSON = function() {
    return json;
}

module.exports.PDF2JSONUtil = (function () {

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
    return cls;
})();

