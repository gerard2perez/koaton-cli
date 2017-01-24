import { sync as spawn } from 'cross-spawn';
import { sync as glob } from 'glob';
import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';
import BundleItem from '../../src/support/BundleItem';

const addtoBundle = (data) => {
	let bundle = require(path.join(process.cwd(), 'config', 'bundles')).default;
	for (const file in data) {
		bundle[file] = data[file];
	}
	fs.writeFileSync(path.join(process.cwd(), 'config', 'bundles.js'), `exports.default =${JSON.stringify(bundle)} ;`, 'utf8');
};

let tests = [];
let cmdname = 'koaton build';

tests.push(new TestNode(cmdname, [undefined, {
	H: true
}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf('koaton build') > -1;
	});

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		fs.removeSync(ProyPath('./.koaton'));
		global.skipshell = false;
		process.chdir('testingapp');
		spawn('git', ['clone', 'https://github.com/gerard2p/koatonstyle.git', 'assets/flatadmin']);
		addtoBundle({
			'admin.css': [
				'./assets/flatadmin/css/**/*.css'
			],
			'admin.js': [
				'./assets/flatadmin/js/jquery.min.js',
				'./assets/flatadmin/js/bootstrap.min.js',
				'./assets/flatadmin/js/Chart.min.js',
				'./assets/flatadmin/js/bootstrap-switch.min.js',
				'./assets/flatadmin/js/jquery.matchHeight-min.js',
				'./assets/flatadmin/js/jquery.dataTables.min.js',
				'./assets/flatadmin/js/dataTables.bootstrap.min.js',
				'./assets/flatadmin/js/select2.full.min.js',
				'./assets/flatadmin/js/ace/ace.js',
				'./assets/flatadmin/js/ace/mode-html.js',
				'./assets/flatadmin/js/ace/theme-github.js',
				'./assets/flatadmin/js/app.js',
				'./assets/flatadmin/js/index.js'
			]
		});
		process.env.isproyect = 'true';
		for (const file of Object.keys(require.cache)) {
			if (file.indexOf('bundles') > -1 || file.indexOf('globals') > -1 || file.indexOf('ember') > -1) {
				delete require.cache[file];
			}
		}
		global.scfg = new ServerConfiguaration();
		requireNoCache(ProyPath('node_modules', 'koaton/lib/support', 'globals'));
		configuration.ember = requireNoCache(ProyPath('config', 'ember')).default;
		for (const key of Object.keys(configuration.bundles)) {
			let bundle = new BundleItem(key, configuration.bundles[key]);
			configuration.bundles[key] = bundle;
		}
		scfg.env = 'development';
	})
	.Exists('public', 'css', '0admin.css')
	.Exists('public', 'js', 'admin.min.js')
	.Exists('public', 'js', 'admin.js.map')
	.Expect('Builds Ember Apps', true, () => {
		for (const app of scfg.emberApps) {
			fs.accessSync(ProyPath('public', app.directory));
			fs.accessSync(ProyPath('public', app.directory, 'assets'));
			fs.accessSync(ProyPath('public', app.directory, 'assets', 'vendor.css'));
			fs.accessSync(ProyPath('public', app.directory, 'assets', 'restapp.css'));
			fs.accessSync(ProyPath('public', app.directory, 'assets', 'vendor.js'));
			fs.accessSync(ProyPath('public', app.directory, 'assets', 'restapp.js'));
			fs.accessSync(ProyPath('public', app.directory, 'assets', 'vendor.map'));
		}
		return true;
	})
	.Expect('Compress Images', true, () => {
		for (const image of glob(ProyPath('assets', 'img', '*.{jpg,png}'))) {
			fs.accessSync(ProyPath('public', 'img', path.basename(image)));
		}
		return true;
	})
	.Expect('Copy Static Content', true, () => {
		const copy = requireSafe(ProyPath('config', 'copy'), {});
		for (const dir in copy) {
			for (const idx in copy[dir]) {
				let directories = glob(ProyPath(copy[dir][idx]));
				for (const file of directories) {
					fs.accessSync(ProyPath('public', dir, path.basename(file)));
				}
			}
		}
		return true;
	});

tests.last.CleanUp(() => {
	global.skipshell = false;
	process.chdir('..');
});
export { tests as config, cmdname as testname };
