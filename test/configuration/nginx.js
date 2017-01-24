import {sync as spawn} from 'cross-spawn';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import ServerConfiguaration from '../../src/support/Server';
import '../support/array';

let tests = [];
let cmdname = 'koaton nginx';

tests.push(new TestNode(cmdname, [{
	H: true
}], true, true))
	.SetUp(() => {
		let log = spawn('nginx', ['-t'], {
			shell: true
		});
		log = log.stdout.toString() || log.stderr.toString();
		let nginxpath = log.match(/.* file (.*)nginx\.conf test/)[1];
		let conf = fs.readFileSync(nginxpath + 'nginx.conf', 'utf-8');
		conf = conf.replace('include enabled_sites/*.conf;', '');
		fs.outputFileSync(nginxpath + 'nginx.conf', conf);

		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		scfg.port = 62626;
		global.skipshell = true;
	})
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode(cmdname, [{
	generate: true
}], true, true))
	.Expect('creates .conf file', true, () => {
		return fs.accessSync('testingapp.conf') === undefined;
	});

tests.push(new TestNode(cmdname, [{
	generate: false
}], true, true));

tests.last.CleanUp(() => {
	process.chdir('..');
});
export { cmdname as testname, tests as config };
