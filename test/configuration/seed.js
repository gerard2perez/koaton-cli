import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton seed';

tests.push(new TestNode(cmdname, [undefined, {
		H: true
	}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf("koaton seed") > -1;
	});

tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
		fs.removeSync(ProyPath("seeds", "user.js"));
	})
	.Expect('Nothing to seed', true, (log) => {
		return log.indexOf("Nothing to seed") > -1;
	});

tests.push(new TestNode(cmdname, ["user", {
		generate: true
	}], true, true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
		fs.removeSync(path.join(process.cwd(), "seeds", "user.js"));
	})
	.Expect('Creates a seed file', true, () => {
		return lfs.accessSync(ProyPath("seeeds","user.js")) === undefined;
	});

export {
	tests as config,
	cmdname as testname
};
