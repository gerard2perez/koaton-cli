import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import {sync as spawn} from 'cross-spawn';
// import requireNoCache from '../support/custom_require';

const targetdir = path.join(process.cwd(), 'testingapp');

let tests = [];
let cmdname = 'koaton new';
tests.push(new TestNode('(no args)', ['', {}], true))
	.SetUp(() => {
		fs.removeSync(targetdir);
	})
	.Expect('Ask to render help.', 'The command requires a name to run.\n\tkoaton new -h\nto see help.', (log) => log);
	// tests.push(new TestNode('Must render help',['-h',{}],false));

tests.push(new TestNode('koaton new', ['testingapp', {
	skipNpm: true,
	skipBower: true,
	db: 'mysql'
}], true, true))
	.Exists('testingapp', 'app.js')
	.Exists('testingapp', '.editorconfig')
	.Exists('testingapp', '.gitignore')
	.Exists('testingapp', 'routes.js')
	.Exists('testingapp', 'config', 'bundles.js')
	.Exists('testingapp', 'config', 'connections.js')
	.Exists('testingapp', 'config', 'ember.js')
	.Exists('testingapp', 'config', 'inflections.js')
	.Exists('testingapp', 'config', 'security.js')
	.Exists('testingapp', 'config', 'server.js')
	.Exists('testingapp', 'config', 'static.js')
	.Exists('testingapp', 'config', 'views.js')
	.Exists('testingapp', 'controllers')
	.Exists('testingapp', 'ember')
	.Exists('testingapp', 'models')
	.Exists('testingapp', 'locales')
	.Exists('testingapp', 'public')
	.Exists('testingapp', 'seeds')
	.Exists('testingapp', 'views', 'layouts', 'main.handlebars')
	.Exists('testingapp', 'views', 'index.html')
	.Expect(() => {
		let res = true;
		try {
			res = res && requireNoCache(path.join(targetdir, 'package.json')).dependencies.mysql !== undefined;
			res = res && requireNoCache(path.join(targetdir, 'package.json')).dependencies.mongoose === undefined;
		} catch (e) {
			console.log(e.stack);
			res = false;
		}
		return res;
	})
	.CleanUp(() => {
		fs.removeSync(targetdir);
	});

// TODO: test disabled until ejs support added
// tests.push(new TestNode('koaton new', ['testingapp', {
// 		skipNpm: true,
// 		skipBower: true,
// 		viewEngine: 'ejs'
// 	}], true, true))
// 	.Expect(() => {
// 		let res = true;
// 		try {
// 			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.ejs !== undefined;
// 			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.handlebars === undefined;
// 		} catch (e) {
// 			res = false;
// 		}
// 		return res;
// 	});
tests.push(new TestNode('koaton new', ['testingapp', {
	skipNpm: true,
	skipBower: true,
	force: true,
	viewEngine: 'handlebars',
	db: 'redis'
}], true, true))
	.Expect(() => {
		let res = true;
		try {
			res = res && requireNoCache(path.join(targetdir, 'package.json')).dependencies.redis !== undefined;
			res = res && requireNoCache(path.join(targetdir, 'package.json')).dependencies.handlebars !== undefined;
			res = res && requireNoCache(path.join(targetdir, 'package.json')).dependencies.ejs === undefined;
			res = res && requireNoCache(path.join(targetdir, 'package.json')).dependencies.mysql === undefined;
		} catch (e) {
			console.log(e.stack);
			res = false;
		}
		return res;
	});
tests.push(new TestNode('koaton new', ['testingapp', {
	force: true
}], true, true))
	.SetUp(() => {
		spawn('npm', ['i', 'passport-local']);
	})
	.Exists('testingapp', 'node_modules');
tests.last.CleanUp(() => {
	// fs.removeSync(targetdir);
});

export { tests as config };
export { cmdname as testname };
