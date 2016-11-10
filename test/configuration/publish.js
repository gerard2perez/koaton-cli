import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton publish';

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		global.skipshell = true;
	})
	.Expect('Building assets for production', true, log => log.indexOf("Building assets for production") > -1)
	.Expect('Adding changes', true, log => log.indexOf("Adding changes") > -1)
	.Expect('Commiting changes', true, log => log.indexOf("Commiting changes") > -1)
	.Expect('Pushing changes', true, log => log.indexOf("Pushing changes") > -1);

tests.push(new TestNode(cmdname, [{
		H: true
	}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode(cmdname, [{
		semver: "patch"
	}], true, true))
	.Expect('Building assets for production', true, log => log.indexOf("Building assets for production") > -1)
	.Expect('Dumping version', true, log => log.indexOf("Adding changes") > -1)
	.Expect('Adding changes', true, log => log.indexOf("Adding changes") > -1)
	.Expect('Commiting changes', true, log => log.indexOf("Commiting changes") > -1)
	.Expect('Pushing changes', true, log => log.indexOf("Pushing changes") > -1);


tests.push(new TestNode(cmdname, [{
		semver: "patch",
		tag: "beta"
	}], true, true))
	.Expect('Building assets for production', true, log => log.indexOf("Building assets for production") > -1)
	.Expect('Dumping version', true, log => log.indexOf("Adding changes") > -1)
	.Expect('Adding changes', true, log => log.indexOf("Adding changes") > -1)
	.Expect('Commiting changes', true, log => log.indexOf("Commiting changes") > -1)
	.Expect('Pushing changes', true, log => log.indexOf("Pushing changes") > -1)
	.Expect('Publishing to npm', true, log => log.indexOf("Pushing changes") > -1);
tests.last.CleanUp(() => {
	process.chdir('..')
});
export {
	tests as config,
	cmdname as testname
};
