import { sync as spawn } from 'cross-spawn';
import { sync as glob } from 'glob';
import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import BundleItemCLI from '../../src/support/BundleItem';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

const addtoBundle = (data) => {
	let bundle = require(path.join(process.cwd(), 'config', 'bundles')).default;
	for (const file in data) {
		bundle[file] = data[file];
	}
	fs.writeFileSync(path.join(process.cwd(), 'config', 'bundles.js'), `exports.default =${JSON.stringify(bundle)} ;`, 'utf8');
};

let tests = [];
let cmdname = 'koaton build';

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		require.cache = [];
		process.env.NODE_ENV = 'development';
		fs.removeSync(ProyPath('./.koaton'));
		global.skipshell = false;
		process.chdir('testingapp');
		spawn('git', ['clone', 'https://github.com/gerard2p/koatonstyle.git', 'assets/flatadmin']);
		addtoBundle({
			'main.css': [
				'./assets/flatadmin/less/bootstrap.less'
			],
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
		// for (const file of Object.keys(require.cache)) {
		// 	if (file.indexOf('bundles') > -1 || file.indexOf('globals') > -1 || file.indexOf('ember') > -1) {
		// 		delete require.cache[file];
		// 	}
		// }
		requireNoCache(ProyPath('node_modules', 'koaton/support', 'globals'));
		const BundleItem = requireNoCache(ProyPath('node_modules', 'koaton/support', 'BundleItem')).default;
		configuration.ember = requireNoCache(ProyPath('config', 'ember')).default;
		scfg.env = 'development';
		global.scfg = new ServerConfiguaration();
		for (const key of Object.keys(configuration.bundles)) {
			if (!scfg.bundles[key]) {
				scfg.bundles.add(new BundleItemCLI(key, configuration.bundles[key]));
			}
			configuration.bundles[key] = new BundleItem(key, configuration.bundles[key]);
		}
	})
	.Exists('public', 'css', '0admin.css')
	.Exists('public', 'js', 'admin.min.js')
	.Exists('public', 'js', 'admin.map')
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
		const {copy} = require(ProyPath('config', 'static'), {}).default;
		for (const item of copy) {
			for (const filepath of item.src) {
				let originalnodes = filepath.split('/');
				let directories = glob(ProyPath(filepath));
				for (const file of directories) {
					let filename = path.basename(file);
					if (item.flatten) {
						fs.accessSync(ProyPath('public', path.basename(file)));
					} else {
						let targetnodes = file.split('/');
						let filtered = originalnodes.filter(n => targetnodes.indexOf(n) > -1).join('/');
						filtered = path.dirname(file).replace(filtered, '');
						filename = path.join(filtered, filename);
						fs.accessSync(filename);
					}
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
