var common = {};
common.question = require('../common/question.js');

exports.testIsQuestion = function(test) {
	var user = {'correct':[{id:1},{id:2}],'incorrect':[{id:3},{id:4}]};
	test.expect(2);
	common.question.isQuestion(user,'correct',1,function(index) {
		test.ok(index > -1);
	});
	common.question.isQuestion(user,'incorrect',-1, function(index) {
		test.ok(index === -1);
	});
	test.done();
}
