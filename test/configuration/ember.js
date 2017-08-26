import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';

let tests = [];
let cmdname = 'koaton ember';
tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		require(ProyPath('node_modules', 'koaton/support', 'globals'));
		fs.removeSync(path.join(process.cwd(), 'ember', 'restapp'));
	})
	.Expect('Ask to render help.', true, (log) => {
		return log.indexOf('to see help') > -1;
	});

tests.push(new TestNode(cmdname, [undefined, {
	H: true
}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf('koaton ember') > -1;
	});

tests.push(new TestNode(cmdname, [undefined, {
	list: true
}], true, true))
	.Expect('List of Ember Apps', '  No Apps Installed', (log) => log);

tests.push(new TestNode(cmdname, [undefined, {
	use: 'ember-cli-crudtable'
}], true, true))
	.Expect('Ask to render help.', true, (log) => {
		return log.indexOf('to see help') > -1;
	});

tests.push(new TestNode(cmdname, [undefined, {
	mount: '/default'
}], true, true))
	.Expect('Ask to render help.', true, (log) => {
		return log.indexOf('to see help') > -1;
	});

tests.push(new TestNode(cmdname, [undefined, {
	build: 'development'
}], true, true))
	.Expect('Ask to render help.', true, (log) => {
		return log.indexOf('to see help') > -1;
	});

tests.push(new TestNode(cmdname, ['restapp', {
	force: true,
	mount: '/panel',
	build: 'development'
}], true, true))
	.Expect('App does not exists.', '  That ember app does not exist.', (log) => log);

tests.push(new TestNode(cmdname, ['restapp', {
	use: 'ember-cli-crudtable'
}], true, true))
	.Expect('App does not exists.', '  That ember app does not exist.', (log) => log);

tests.push(new TestNode(cmdname, ['restapp', {
	mount: '/panel',
	force: true
}], true, true))
	.Expect('Application folder is created', true, (_, project) => {
		try {
			fs.accessSync(path.join(project, 'ember', 'restapp'));
		} catch (e) {
			return e;
		}
		return true;
	})
	.Expect('Koaton ember config is modified', true, (log, project) => {
		let lib = require.resolve(ProyPath('config', 'ember'));
		delete require.cache[lib];
		const config = require(ProyPath('config', 'ember')).default.restapp;
		return config.mount === '/panel' &&
			config.directory === 'restapp' &&
			config.access === 'public' &&
			config.adapter === 'localhost' &&
			config.subdomain === 'www' &&
			config.layout === 'main';
	});

tests.push(new TestNode(cmdname, [undefined, {
	list: true
}], true, true))
	.Expect('List of Ember Apps', true, (log) => {
		return log.indexOf('restapp') > -1;
	});

tests.push(new TestNode(cmdname, ['restapp', {
	use: 'ember-cli-crudtable'
}], true, true))
	.Expect('Installs the ember-component', true, (_, project) => {
		try {
			fs.accessSync(path.join(project, 'ember', 'restapp', 'node_modules', 'ember-cli-crudtable'));
		} catch (e) {
			return e;
		}
		return true;
	});

// TODO: Building ember apps this ways seem to mess with my global .babelrc
// tests.push(new TestNode(cmdname, ['restapp', {
// 	build: 'development'
// }], true, true));
// tests.push(new TestNode(cmdname, ['restapp', {
// 	build: 'production'
// }], true, true));

tests.last.CleanUp(() => {
	process.chdir('..');
});
export {
	tests as config
};
export {
	cmdname as testname
};
