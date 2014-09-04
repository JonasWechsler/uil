var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
module.exports = {};
var async = require('async');
var execute = function(command, callback) {
	exec(command, function(err, stdout, stderr) {
		callback(err, stdout, stderr);
	});
}

module.exports.compile = function(type, inputDir, inputFile, callback) {
	var compile_command;
	switch(type) {
		case 'java': compile_command = 'javac ' + inputDir + '/' + inputFile; 
					 break;
		case 'cc': compile_command = 'g++ ' + inputDir + '/' + inputFile  + ' -o '  + inputDir + '/' + inputFile.substring(0,inputFile.lastIndexOf('.cc'));
    			   break;
		case 'c' : compile_command = 'gcc ' + inputDir + '/' + inputFile  + ' -o '  + inputDir + '/' + inputFile.substring(0,inputFile.lastIndexOf('.c'));
				   break;
		case 'py' : break;
	}
	if(compile_command && compile_command !== undefined) {
		execute(compile_command, callback);
	} else {
		callback();
	}
}

module.exports.run = function(type, inputDir, inputFile, callback) {
	var run_command;
	switch(type) {
		case 'java': run_command = 'cd programs && java -Djava.security.manager -Djava.security.policy=user.policy -cp . ' + inputFile.substring(0,inputFile.lastIndexOf('.java'));
			break;
		case 'cc': run_command = './' + inputDir + '/' + inputFile.substring(0,inputFile.lastIndexOf('.cc'));
		    break;
		case 'c': run_command = './' + inputDir + '/' + inputFile.substring(0,inputFile.lastIndexOf('.c'));
		    break;
		case 'py': run_command = 'python ' + inputDir + '/' + inputFile;
		   	break;
	}
	if(run_command && run_command !== undefined) {
		execute(run_command, callback);
	} else { 
		callback('nothing run',undefined,undefined);
	}
}

module.exports.clearPrograms = function() {
	execute('find ./programs/ -not -name ".gitignore" -not -name "user.policy" -delete', function(err, stdout, stderr) {
		console.log(err);
		console.log(stderr);
	});
}

module.exports.remove = function(files) {
	async.each(files, function(file, callback) {
		execute('find . -wholename ' + file + ' -delete', function (err, stdout, stderr) {
			console.log(err);
			console.log(stdout);
			console.log(stderr);
		});
	}, function(err) {
		console.log(err);
	});
}