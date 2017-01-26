import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';
import * as fs from 'fs-extra';

let tests = [];
let cmdname = 'koaton serve';
function touch(...args) {
	fs.closeSync(fs.openSync(ProyPath(...args), 'a'));
	return wait(args.join('/'), 300);
}
function wait (message, time = 100) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve([message, true, true]);
		}, time);
	});
}
// tests.push(new TestNode(cmdname, [undefined, {
// 	H: true
// }], true, true))
// 	.Expect('Renders help', true, (log) => {
// 		return log.indexOf(cmdname) > -1;
// 	});

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		requireUnCached(ProyPath('node_modules', 'koaton/lib/support', 'globals'));
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
		process.env.istesting = true;
	})
	.Expect('Touches a static.js', function () {
		return touch('config', 'static.js');
	});
tests.last.asyncs = true;
export { tests as config, cmdname as testname };
