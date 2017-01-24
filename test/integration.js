/*globals describe, it, cleanString*/
import * as assert from 'assert';
import * as co from 'co';
import commands from '../src/commands';
import configuration from './configuration';

const CommandOrder = [
	'modulify',
	'fail'
].concat(['new', 'adapter', 'ember', 'model', 'nginx', 'install', 'build', 'seed', 'modulify' /*, 'serve' //TODO enable. FIX 001*/, 'forever', 'publish']);

const notestcase = function (testname) {
	describe(testname, () => {
		it('NO TESTS', function () {
			assert.equal(true, false);
		});
	});
};

const testcase = function testcase (TestConfig, cwd, testname, command) {
	describe(testname, function () {
		for (const testdata of (TestConfig || [])) {
			it(testdata.name, function (done) {
				this.timeout(1000 * 60 * 5);
				testdata.SetUp();
				co(function * () {
					let err = null;
					const ori = console.log;
					const WriteE = process.stderr.write;
					const WriteO = process.stdout.write;
					try {
						let buffer = '';
						// process.stderr.write = () => {};
						// process.stdout.write = () => {};
						console.log = (data) => {
							ori(data);
							buffer += (data || '').toString();
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
						ori(e.red);
						err = e;
					} finally {
						require.cache = [];
						testdata.CleanUp();
						console.log = ori;
						process.stderr.write = WriteE;
						process.stdout.write = WriteO;
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
describe('Integration tests.', function () {
	for (const command of CommandOrder) {
		const CommandTest = configuration[command];
		if (CommandTest && CommandTest.config) {
			// console.log(CommandTest, command);
			testcase(CommandTest.config, CommandTest.cwd, CommandTest.testname, commands[command]);
		} else {
			console.log(CommandTest);
			notestcase(command);
		}
	}
});
