import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton semver';

tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
		fs.removeSync(ProyPath("seeds", "user.js"));
	})
	.Expect('Ask to render help', true, log => log.indexOf("koaton semver -h") > -1);

tests.push(new TestNode(cmdname, [undefined, {
		H: true
	}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf("koaton semver")>-1;
	});

tests.push(new TestNode(cmdname, ["0.0.0", {}], true, true))
	.Expect('Creates a seed file', "0.0.0", () => requireNoCache(ProyPath("package.json")).version);

tests.push(new TestNode(cmdname, ["major", {}], true, true))
	.Expect('Creates a seed file', "1.0.0", () => requireNoCache(ProyPath("package.json")).version);

tests.push(new TestNode(cmdname, ["minor", {}], true, true))
	.Expect('Creates a seed file', "1.1.0", () => requireNoCache(ProyPath("package.json")).version);

tests.push(new TestNode(cmdname, ["patch", {}], true, true))
	.Expect('Creates a seed file', "1.1.1", () => requireNoCache(ProyPath("package.json")).version);

// tests.push(new TestNode(cmdname, ["alpha", {}], true, true))
// 	.Expect('Creates a seed file', "2.0.0-alpha.1", () => requireNoCache(ProyPath("package.json")).version);
//
// tests.push(new TestNode(cmdname, ["alpha", {}], true, true))
// 	.Expect('Creates a seed file', "2.0.0-alpha.2", () => requireNoCache(ProyPath("package.json")).version);
//
// tests.push(new TestNode(cmdname, ["beta", {}], true, true))
// 	.Expect('Creates a seed file', "2.0.0-beta.1", () => requireNoCache(ProyPath("package.json")).version);
//
// tests.push(new TestNode(cmdname, ["beta", {}], true, true))
// 	.Expect('Creates a seed file', "2.0.0-beta.2", () => requireNoCache(ProyPath("package.json")).version);

tests.push(new TestNode(cmdname, ["major", {}], true, true))
	.Expect('Creates a seed file', "2.0.0", () => requireNoCache(ProyPath("package.json")).version);

export {
	tests as config,
	cmdname as testname
};
