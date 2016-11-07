import * as path from 'upath';
import TestNode from '../support/TestNode';
import '../support/array';

let tests = [];
let cmdname = 'koaton adapter';
tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
	})
	.Expect('Ask to render help.', '   The command cannot be run this way.\n\tkoaton adapter -h\n   to see help.', (log) => log);

tests.push(new TestNode(cmdname, [undefined, {
		H: true
	}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf("koaton adapter") > -1;
	});

tests.push(new TestNode(cmdname, [undefined, {
		list: true
	}], true, true))
	.Expect('List of Drivers', true, (log) => {
		return log.indexOf("Available drivers:") > -1 && log.indexOf("Installed drivers:") > -1;
	});

tests.push(new TestNode(cmdname, ["redbird", {}], true, true))
	.Expect('Render List of drivers due to a wrong adapter requested', true, (log) => {
		return log.indexOf("The driver you especied is not available please check:") > -1;
	});

tests.push(new TestNode(cmdname, ["sqlite3", {}], true, true))
	.Expect('Installs the driver', true, (log) => {
		return log.indexOf("installed") > -1 && log.indexOf("connections.js") > -1;
	});

tests.push(new TestNode(cmdname, ["mysql", {
		generate: true,
		host: 'remotelocation',
		port: 90000,
		user: 'gerard2p',
		db: 'awsome',
		pass: 'secure'
	}], true, true))
	.Expect('Check parameters', true, (log, project) => {
		let config = requireNoCache(path.join(project, "config", "connections.js")).mysql;
		return config.host === "remotelocation" &&
			config.port === 90000 &&
			config.user === 'gerard2p' &&
			config.database === "awsome" &&
			config.password === "secure";
	});
tests.push(new TestNode(cmdname, ["sqlite3", {
		generate: true,
		host: 'remotelocation',
		port: 90000,
		user: 'gerard2p',
		db: 'awsome',
		pass: 'secure'
	}], true, true))
	.Expect('Check parameters', true, (log, project) => {
		let config = requireNoCache(path.join(project, "config", "connections.js")).sqlite3;
		return config.host === undefined &&
			config.port === undefined &&
			config.user === 'gerard2p' &&
			config.database === "awsome" &&
			config.password === "secure";
	});
tests.push(new TestNode(cmdname, ["sqlite3", {
	uninstall: true
}], true, true));

tests.last.CleanUp(() => {
	process.chdir('..')
});
export {
	tests as config
};
export {
	cmdname as testname
};
