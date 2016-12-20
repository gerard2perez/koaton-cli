import 'colors';
import * as path from 'upath';
import * as buildcmd from './build';
import utils from '../utils';
import Command from '../Command';

let emberProyectPath;
const newproyect = async function newproyect (appName, options) {
	if (await utils.challenge(emberProyectPath, `destination ${emberProyectPath.yellow} is not empty, continue?`, options.force)) {
		await utils.shell(`Installing ${appName.green}`, ['ember', 'new', appName, '-dir', emberProyectPath], process.cwd());
		await utils.mkdir(path.join('ember', appName, 'app', 'initializers'));
		await buildcmd.getInflections(appName, true);
		return false;
	} else {
		return true;
	}
};

export default (new Command(__filename, 'Creates a new ember app with the especified named.'))
.Args('appName')
	.Options([
		['-l', '--list', 'Shows all the ember apps of the project'],
		['-f', '--force', 'Overrides the current app.'],
		['-u', '--use <ember_addon>', 'Install the especified addon in the especified app.'],
		['-m', '--mount <path>', '(Default: /) Sets the mounting path in the koaton app. Can be used with -n or alone.'],
		['-b', '--build <env>', '[ development | production] Builds the especified ember app in the Koaton app.'],
		['--subdomain', '--subdomain <subdomain>', '(Default: www) Sets the subdomain to mount the application.'],
		['--port', '--port <port>', 'port to build']
	])
	.Action(async function (appName, options) {
		let res = false;
		if ((!appName && !options.list) || (!appName && !!(options.use || options.prod || options.build || options.port))) {
			console.log('   The command cannot be run this way.\n\tkoaton ember -h\n   to see help.'.yellow);
			return res;
		} else if (appName && !utils.canAccess(ProyPath('ember', appName)) && !!(options.use || options.prod || options.build || options.port)) {
			console.log('  That ember app does not exist.');
			return res;
		}
		emberProyectPath = ProyPath('ember', appName || '');
		if (options.list) {
			const dirs = readDir('./ember');
			dirs.forEach((dir) => {
				console.log(`${dir}@${require(ProyPath('ember', dir, 'bower.json')).dependencies.ember}`);
			});
			if (dirs.length === 0) {
				console.log('  No Apps Installed');
			}
		} else if (options.use) {
			res = await utils.shell(`Installing ${options.use.green} addon on ${appName.cyan}`, ['ember', 'i', options.use], emberProyectPath);
			console.log(!res ? 'Success'.green : 'Failed'.red);
		} else if (options.build) {
			const embercfg = require(ProyPath('config', 'ember'))[appName];
			res = !(await buildcmd.preBuildEmber(appName, embercfg) &&
			await buildcmd.buildEmber(appName, {
				mount: embercfg.directory,
				build: options.build
			}) &&
			await buildcmd.postBuildEmber(appName, embercfg));
		} else {
			const connections = require(ProyPath('config', 'connections'));
			const connection = require(ProyPath('config', 'models')).connection;
			const port = require(ProyPath('config', 'server')).port;
			const host = connections[connection].host;
			options.mount = path.join('/', options.mount || '').replace(/\\/igm, '/');
			res = await newproyect(appName, options);
			res &= !((await utils.mkdir(ProyPath('ember', appName, 'app', 'adapters'))) &&
				utils.render(TemplatePath('ember_apps', 'adapter.js'), ProyPath('ember', appName, 'app', 'adapters', 'application.js'), {
					localhost: host,
					port: port
				}));
			var emberjs = require(ProyPath('config', 'ember.js'));
			emberjs[appName] = {
				mount: options.mount,
				directory: appName,
				access: 'public',
				adapter: 'localhost',
				subdomain: options.subdomain || 'www',
				layout: 'main'
			};
			utils.write(ProyPath('config', 'ember.js'), `'use strict';\n\nmodule.exports=${JSON.stringify(emberjs, 2, 2)};`, true);
			let embercfg = await utils.read(path.join(emberProyectPath, 'config', 'environment.js'), {
				encoding: 'utf-8'
			});
			embercfg = embercfg.replace(/baseURL: ?'.*',/, `baseURL: '${options.mount}',`);
			utils.write(path.join(emberProyectPath, 'config', 'environment.js'), embercfg, true);
		}
		return res;
	});
