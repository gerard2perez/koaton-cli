import TestNode from '../support/TestNode';
import ServerConfiguaration from '../../src/support/Server';
import '../support/array';

let tests = [];
let cmdname = 'koaton install';
tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		global.skipshell = true;
	});

tests.last.CleanUp(() => {
	process.chdir('..');
});
export {
	tests as config,
	cmdname as testname
};
