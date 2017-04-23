import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';
import * as fs from 'fs-extra';
import * as path from 'upath';
let staticfile = `'use strict';

exports.default = {
	directory: ProyPath('public'),
	configuration: {},
	copy: [
		{
			dest: './img',
			src: [
				'./assets/img/koaton.png'
			],
			flatten: true
		}
	],
	cache: {
		etagWeak: false
	}
};
`;

let defaultstatiFile = `'use strict';

exports.default = {
	directory: ProyPath('public'),
	configuration: {},
	copy: [
		{
			src: ['./assets/flatadmin/js/**/*.*'],
			dest: './js',
			flatten: true
		},
		{
			src: ['./assets/flatadmin/css/**/*.*'],
			dest: './css',
			flatten: true
		},
		{
			dest: './fonts',
			src: ['./assets/flatadmin/fonts/*.*'],
			flatten: true
		},
		{
			dest: './img',
			src: [
				'./assets/flatadmin/img/app-header-bg.jpg',
				'./assets/flatadmin/img/contact-us-bg.jpg',
				'./assets/flatadmin/img/bg/picjumbo.com_HNCK3558.jpg'
			],
			flatten: true
		},
		{
			dest: './img/bg',
			src: [
				'./assets/flatadmin/img/bg/picjumbo.com_HNCK3558.jpg'
			],
			flatten: true
		}

	],
	cache: {
		etagWeak: false
	}
};
`;

let tests = [];
let cmdname = 'koaton serve';
function touch (...args) {
	fs.closeSync(fs.openSync(ProyPath(...args), 'a'));
	return wait(3000);
}
function wait ( time = 100 ) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log('resolve wait promise');
			resolve(true);
		}, time);
	});
}
// tests.push(new TestNode(cmdname, [undefined, {
// 	H: true
// }], true, true))
// 	.Expect('Renders help', true, (log) => {
// 		return log.indexOf(cmdname) > -1;
// 	});

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.NODE_ENV = 'development';
		process.env.isproyect = 'true';
		requireUnCached(ProyPath('node_modules', 'koaton/lib/support', 'globals'));
		requireUnCached(CLIPath('support', 'CheckBundles'));
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
		process.env.istesting = true;
		fs.copySync(
			path.join(process.cwd(), '..', 'templates', 'public', 'img', 'koaton.png'),
			path.join(process.cwd(), 'assets', 'img', 'showcase.png')
		);
		fs.copySync(
			path.join(process.cwd(), '..', 'test', 'templates', 'ember_index.html'),
			path.join(process.cwd(), 'ember', 'restapp', 'app', 'index.html')
		);
		fs.emptyDir(path.join(process.cwd(), 'public', 'img'));
		fs.writeFileSync(path.join(process.cwd(), 'config', 'static.js'), defaultstatiFile);
	})
	.Expect('Touches a static.js', true, function () {
		fs.writeFileSync(path.join(process.cwd(), 'config', 'static.js'), staticfile);
		return touch('config', 'static.js');
	});
tests.last.asyncs = true;
// tests.push(new TestNode(cmdname, [{
// 	// nginx: true,
// 	// skipBuild: true,
// 	// port: 5000
// }], true))
// 	.SetUp(() => {
// 		process.env.NODE_ENV = 'development';
// 		process.env.isproyect = 'true';
// 		scfg.env = 'development';
// 		process.env.istesting = true;
// 	})
// 	.Expect('Touches a static.js', true, function () {
// 		fs.writeFileSync(path.join(process.cwd(), 'config', 'static.js'), staticfile);
// 		return touch('config', 'static.js');
// 	});
// tests.last.asyncs = true;
tests.last.CleanUp(() => {
	process.chdir('..');
});
export { tests as config, cmdname as testname };
