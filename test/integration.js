import * as assert from 'assert';
import importindex from '../src/utils/importindex';
import configuration from './configuration';

const CommandOrder = [].concat([
	// 'new',
	// 'adapter',
	// 'ember',
	// 'model',
	// 'relation',
	// 'translate',
	// 'nginx',
	// 'install',
	'build',
	'seed',
	'modulify',
	// 'serve'
]);

const notestcase = function (testname) {
	describe(testname, () => {
		it('NO TESTS', function () {
			assert.equal(true, false);
		});
	});
};
function takeone (data) {
	if (data.length === 0) {
		return Promise.resolve(true);
	}
	let test = data.splice(0, 1)[0];
	let [message, mustbe, Actual] = test();
	return Actual.then((actual) => {
		assert.equal(actual, mustbe, message);
		return takeone(data);
	});
}
const testcase = function testcase (TestConfig, cwd, testname, command) {
	describe(testname, function () {
		for (const testdata of (TestConfig || [])) {
			it(testdata.name, async function () {
				this.timeout(1000 * 60 * 5);
				testdata.SetUp();
				let err = null;
				const ori = console.log;
				const WriteE = process.stderr.write;
				const WriteO = process.stdout.write;
				try {
					let buffer = '';
					process.stderr.write = () => {
					};
					process.stdout.write = () => {
					};
					console.log = (...data) => {
						ori(...data);
						buffer += (data || '').toString();
					};
					if (testdata.asyncs) {
						let res = command.action.apply(null, testdata.args);
						testdata.expect.splice(0, 1);
						return res.then((childIPIDs) => {
							return takeone(testdata.expect).then(() => {
								for (const pid of childIPIDs) {
									process.kill(pid);
								}
							});
						}, (err) => {
							console.log(err);
						});
					} else {
						let res = await command.action.apply(null, testdata.args);
						// console.log = ori;
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
			});
		}
	});
};
describe('Integration tests.', function () {
	for (const command of CommandOrder) {
		const CommandTest = configuration[command];
		if (CommandTest && CommandTest.config) {
			testcase(CommandTest.config, CommandTest.cwd, CommandTest.testname, require(`../src/commands/${command}`).default, CommandTest.asyncs);
		} else {
			console.log(CommandTest);
			notestcase(command);
		}
	}
});
