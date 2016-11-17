import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton forever';

tests.push(new TestNode(cmdname, [{
		H: true
	}], true, true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
	})
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode(cmdname, [{
		list: true
	}], true, true))
	.Expect('Runs the server', true, (log) => {
		return log.indexOf("No forever processes running") > -1;
	});

tests.push(new TestNode('(no args)', [{}], true))
	.Expect('Runs the server', true, (log) => {
		return log.indexOf("testingapp is running ...") > -1;
	});

tests.push(new TestNode(cmdname, [{
		list: true
	}], true, true))
	.Expect('Lest the app tunning', true, (log) => {
		return log.indexOf("koaton_testingapp") > -1;
	});

tests.push(new TestNode(cmdname, [{
	logs: "testingapp"
}], true, true));

tests.push(new TestNode(cmdname, [{
	stop: "all"
}], true, true));

tests.push(new TestNode(cmdname, [{
	stop: "testingapp"
}], true, true));

tests.push(new TestNode(cmdname, [{
	stop: "."
}], true, true));

tests.push(new TestNode(cmdname, [{
		list: true
	}], true, true))
	.Expect('No server running', true, (log) => {
		return log.indexOf("No forever processes running") > -1;
	});
tests.last.CleanUp(() => {
	process.chdir('..')
});

export {
	tests as config,
	cmdname as testname
};
