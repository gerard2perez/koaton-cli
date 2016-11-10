import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';

let tests = [];
let cmdname = 'koaton install';
tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		// process.env.isproyect = 'true';
		// global.scfg = new ServerConfiguaration();
	});

	tests.last.CleanUp(() => {
		process.chdir('..')
	});
export {
	tests as config,
	cmdname as testname
};
