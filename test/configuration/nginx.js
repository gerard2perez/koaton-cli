import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import ServerConfiguaration from '../../src/support/Server';
import '../support/array';

let tests = [];
let cmdname = 'koaton nginx';

tests.push(new TestNode(cmdname, [{
}], true, true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		require(ProyPath('node_modules', 'koaton/lib/support', 'globals'));
		global.scfg = new ServerConfiguaration();
		scfg.port = 62626;
		global.skipshell = true;
	})
	.Expect('creates .conf file', true, () => {
		return fs.accessSync('testingapp.conf') === undefined;
	});

tests.push(new TestNode(cmdname, [{
	copy: true
}], true, true));

tests.last.CleanUp(() => {
	process.chdir('..');
});
export { cmdname as testname, tests as config };
