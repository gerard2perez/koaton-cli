import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton modulify';

tests.push(new TestNode(cmdname, [{
		H: true
	}], true, true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		global.skipshell = true;
	})
	.Expect('Renders help', true, log => log.indexOf(cmdname) > -1);

tests.push(new TestNode("(no args)", [{}], true));
tests.last.CleanUp(() => {
	process.chdir('..')
});
export {
	tests as config,
	cmdname as testname
};
