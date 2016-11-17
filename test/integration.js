/*globals describe, it, cleanString*/
import * as assert from 'assert';
import * as co from 'co';
import commands from '../src/commands';
import configuration from './configuration';

const test_order_for_commands = [
	// 'fail',
	// 'nginx', 'fail'
].concat(['new', 'adapter', 'ember', 'model', 'nginx', 'install', 'build', 'seed', 'semver', 'modulify' /*, 'serve' //TODO enable. FIX 001*/ , 'forever', 'publish']);

const notestcase = function(testname) {
	describe(testname, () => {
		it("NO TESTS", function() {
			assert.equal(true, false);
		});
	});
};

const testcase = function testcase(test_config, cwd, testname, command) {
	describe(testname, function() {
		for (const testdata of(test_config || [])) {
			it(testdata.name, function(done) {
				this.timeout(1000 * 60 * 5);
				testdata.SetUp();
				co(function*() {
					let err = null;
					const ori = console.log;
					try {
						let buffer = "";
						console.log = (data) => {
							ori(data);
							buffer += (data || "").toString();
						};
						let res = yield command.action.apply(null, testdata.args);
						console.log = ori;
						assert.equal(!res, testdata.expect[0], `${testname} ${testdata.name} shell result.`);
						testdata.expect.splice(0, 1);
						for (const expect of testdata.expect) {
							let [message, mustbe, actual] = expect(cleanString(buffer), ProyPath());
							assert.equal(actual, mustbe, message);
						}
					} catch (e) {
						console.log(e.red);
						err = e;
					} finally {
						testdata.CleanUp();
						console.log = ori;
					}
					if (err) {
						throw err;
					}
					// done();
				}).then(done, done).catch(done);
				//
			});
		}
	});
};
describe('Integration tests.', function() {
	for (let idx in test_order_for_commands) {
		const command = test_order_for_commands[idx];
		const command_test = configuration[command];
		if (command_test && command_test.config) {
			testcase(command_test.config, command_test.cwd, command_test.testname, commands[command]);
		} else {
			notestcase(command);
		}
	}
});
