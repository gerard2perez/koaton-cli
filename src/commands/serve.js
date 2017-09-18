import { watch as Watch } from 'chokidar';
import * as path from 'path';
import * as fs from 'fs-extra';
import screen from '../welcome';
import spinner from '../spinner';
import Command from 'cmd-line/lib/Command';
import { write, copy, shell } from '../utils';
import livereload from '../utils/livereload';
import CheckBundles from '../support/CheckBundles';
import WatchFileToCopy from '../support/WatchFileToCopy';
import CopyStatic from '../support/CopyStatic';
import deamon from '../deamon';
import { imagecompressor, buildAllImages } from '../functions/imagecompressor';
import EmberBuilder from '../support/EmberBuilder';
let watching = [];
let nginxbuilt = false;
const deleted = function (file) {
		try {
			fs.unlinkSync(file.replace('assets', 'public'));
		} catch (e) {
			console.log(file.replace('assets', 'public'));
		}
		livereload.reload(file);
	},
	compress = function (file) {
		console.log(file);
		imagecompressor([file], file.replace(path.basename(file), '').replace('assets', 'public')).then(() => {
			livereload.reload(file);
		});
	},
	WactchAndCompressImages = function WactchAndCompressImages () {
		let watcher = new Watch(path.join('assets', 'img'), {
			persistent: true,
			ignoreInitial: true,
			alwaysStat: false,
			awaitWriteFinish: {
				stabilityThreshold: 1000,
				pollInterval: 100
			}
		});
		watching.push(watcher);
		watcher
			.on('change', compress)
			.on('unlink', deleted)
			.on('add', compress);
		return buildAllImages();
	},
	/* istanbul ignore next */
	buildHosts = function buildHosts () {
		const os = require('os');

		let subdomains = configuration.server;
		let hostname = subdomains.host;
		subdomains = subdomains.subdomains;
		if (subdomains.indexOf('www') === -1) {
			subdomains.push('www');
		}
		let hostsdlocation = '';
		switch (os.platform()) {
			case 'darwin':
				hostsdlocation = '/private/etc/hosts';
				break;
			case 'linux':
				hostsdlocation = '/etc/hosts';
				break;
			case 'win32':
				hostsdlocation = 'C:\\Windows\\System32\\drivers\\etc\\hosts';
				break;
			default:
				console.log("your os is not detected, hosts files won't be updated".red);
				break;
		}
		/* istanbul ignore else */
		if (hostsdlocation !== '') {
			let changed = false;
			let hostsd = fs.readFileSync(hostsdlocation, 'utf-8');
			for (const subdomain in subdomains) {
				let entry = '127.0.0.1\t' + subdomains[subdomain] + '.' + hostname;
				if (hostsd.indexOf(entry) === -1) {
					hostsd += '\n' + entry;
					changed = true;
				}
			}
			if (changed) {
				write(hostsdlocation, hostsd.replace(/\n+/igm, '\n'), true);
			}
		}
	};
export default (new Command(__filename, 'Runs your awsome Koaton applicaction especially for development'))
	.Options([
		['-n', '--nginx', 'Copy the project .conf in nginx'],
		['-s', '--skip-build', ''],
		['-p', '--production', 'Runs with NODE_ENV = production'],
		['--port', '--port <port>', 'Run on the especified port (port 80 requires sudo).']
	])
	.Action(async function Action (options) {
		process.env.port = options.port || configuration.server.port;
		options.production = options.production ? 'production' : 'development';
		process.env.NODE_ENV = options.production;
		const embercfg = configuration.ember;
		/* istanbul ignore else */
		if (options.production === 'development') {
			buildHosts();
		}
		screen.start();
		/* istanbul ignore else */
		if (options.nginx) {
			const getnginxpath = require('../functions/nginx').getnginxpath;
			await copy(ProyPath(`${scfg.name}.conf`), path.join(await getnginxpath(), 'enabled_sites', `${scfg.name}.conf`), 1);
			nginxbuilt = await shell('Restarting Nginx', ['nginx', '-s', 'reload'], process.cwd());
			nginxbuilt = nginxbuilt === 0;
		}
		/* istanbul ignore else */
		if (options.production === 'development') {
			await CopyStatic();
			await CheckBundles();
			WatchFileToCopy();
			await WactchAndCompressImages();
		}
		await Events('pre', 'build');
		await Events('pre', 'ember_build');
		let buildingAppsEmber = Object.entries(embercfg).map(([app, cfg]) => (new EmberBuilder(app, 'development', cfg)));
		screen.line1(true);
		const building = spinner();
		building.start(100, `Building ${buildingAppsEmber.map(e => e.name).join(', ').green}`, undefined, process.stdout.columns);
		let EmberPids = await Promise.all(buildingAppsEmber.map(e => e.serve(nginxbuilt))).then((reports) => {
			building.end('    Ember apps:');
			for (const report of reports) {
				report.log = true;
				console.log(`      ${report.result}`);
			}
			screen.line1();
			buildingAppsEmber.map(e => e.createWatcher((file) => {
				livereload.reload(file);
			}));
			return reports.map((r) => r.pid);
		});
		await Events('post', 'ember_build');
		return Events('pre', 'serve').then(() => {
			return new Promise(function (resolve, reject) {
				let server = deamon(resolve, reject, EmberPids, nginxbuilt);
				/* istanbul ignore next */
				process.once('SIGINT', function () {
					server.kill();
					resolve(0);
				});
			});
		});
	});
