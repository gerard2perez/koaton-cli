import * as fs from 'fs-extra';
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

tests.push(new TestNode("(no args)", [{}], true))
	.SetUp(() => {
		let source = fs.readFileSync('views/ember_apps/restapp.handlebars', 'utf-8');
		if (source.indexOf("admin.css") === -1) {
			source = source.replace("{{{bundle \"restapp.css\"}}}", "{{{bundle \"restapp.css\"}}}\n\t\t{{{bundle \"admin.css\"}}}")
				.replace("{{{bundle \"restapp.js\"}}}", "{{{bundle \"restapp.js\"}}}\n\t\t{{{bundle \"admin.js\"}}}");
		}
		fs.writeFileSync('views/ember_apps/restapp.handlebars', source);
		process.stdout.write("update test\n");
	});
tests.last.CleanUp(() => {
	process.chdir('..')
});
export {
	tests as config,
	cmdname as testname
};
