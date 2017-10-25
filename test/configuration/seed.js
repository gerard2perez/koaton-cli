import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton seed';

tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		requireNoCache(ProyPath('node_modules', 'koaton/support', 'globals'));
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		// require(ProyPath('node_modules', 'koaton/support', 'globals'));
		scfg.env = 'development';
		fs.removeSync(ProyPath('seeds', 'user.js'));
	});

tests.push(new TestNode(cmdname, ['user', {
	generate: true
}], true, true))
	.Expect('Creates a seed file', true, () => {
		return fs.accessSync(ProyPath('seeds', 'user.js')) === undefined;
	});
tests.last.CleanUp(() => {
	process.chdir('..');
});

export { tests as config, cmdname as testname };
