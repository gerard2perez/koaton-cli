/*globals describe, it, cleanString*/
import * as assert from 'assert';
import * as co from 'co';
import commands from '../src/commands';
import configuration from './configuration';

const CommandOrder = [
	'serve',
	'fail'
].concat(['new', 'adapter', 'ember', 'model', 'nginx', 'install', 'build', 'seed', 'modulify' /*, 'serve' //TODO enable. FIX 001*/, 'forever', 'publish']);

const notestcase = function (testname) {
	describe(testname, () => {
		it('NO TESTS', function () {
			assert.equal(true, false);
		});
	});
};
function takeone (data) {
	console.log(data.length);
	if (data.length === 0) {
		return Promise.resolve(true);
	}
	let test = data.splice(0, 1);
	console.log(test);
	return test().then((result) => {
		let [message, mustbe, actual] = result;
		assert.equal(actual, mustbe, message);
		return takeone(data);
	});
}
const testcase = function testcase (TestConfig, cwd, testname, command) {
	describe(testname, function () {
		for (const testdata of (TestConfig || [])) {
			it(testdata.name, function (done) {
				this.timeout(1000 * 60 * 5);
				testdata.SetUp();
				co(async function () {
					let err = null;
					const ori = console.log;
					const WriteE = process.stderr.write;
					const WriteO = process.stdout.write;
					try {
						let buffer = '';
						// process.stderr.write = () => {};
						// process.stdout.write = () => {};
						// console.log = (data) => {
						// 	ori(data);
						// 	buffer += (data || '').toString();
						// };
						if (testdata.asyncs) {
							let res = command.action.apply(null, testdata.args);
							testdata.expect.splice(0, 1);
							return res.then((ds) => {
								console.log('Mother of GOD GOOD');
								return takeone(testdata.expect).then((res) => {
								// 	done(null, res);
								});
							}, () => {
								console.log('Mother of GOD WRONG');
							});
						} else {
							let res = await command.action.apply(null, testdata.args);
							console.log = ori;
							assert.equal(!res, testdata.expect[0], `${testname} ${testdata.name} shell result.`);
							testdata.expect.splice(0, 1);
							for (const expect of testdata.expect) {
								let [message, mustbe, actual] = expect(cleanString(buffer), ProyPath());
								assert.equal(actual, mustbe, message);
							}
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
			testcase(CommandTest.config, CommandTest.cwd, CommandTest.testname, commands[command], CommandTest.asyncs);
		} else {
			console.log(CommandTest);
			notestcase(command);
		}
	}
});
