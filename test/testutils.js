var common = {};
common.utils = require('../common/utils.js');

exports.testFileNameCheck = function(test) {
	test.ok(common.utils.testFileName('aFiLe.java'));
	test.ok(!common.utils.testFileName(' afile.java'));
	test.ok(!common.utils.testFileName(';af`'));
	test.done();
}
