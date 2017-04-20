import * as spawn from 'cross-spawn';
import { watch as Watch } from 'chokidar';
import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs-extra';
import screen from '../welcome';
import Command from 'cmd-line/lib/Command';
import utils from '../utils';
import livereload from '../utils/livereload';
import CheckBundles from '../support/CheckBundles';
import WatchFileToCopy from '../support/WatchFileToCopy';
import CopyStatic from '../support/CopyStatic';
import deamon from '../deamon';
import imagecompressor from '../functions/imagecompressor';
import { postBuildEmber, preBuildEmber } from '../functions/emberBuilder';

let watching = [],
	building = [];
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
		return imagecompressor();
	},
	serveEmber = function (app, cfg, index) {
		return Promise.promisify((...args) => {
			let [app, mount, cb] = args;
			let appst = {
				log: false,
				result: ''
			};
			const ember = spawn('ember', ['serve', '-lr', 'false', '--output-path', path.join('..', '..', 'public', cfg.directory), '--port', 4200 + index], {
				cwd: ProyPath('ember', app),
				// detached: true,
				shell: true
			});
			ember.stdout.on('data', (buffer) => {
				if (appst.log) {
					console.log(buffer.toString());
				} else if (buffer.toString().indexOf('Build successful') > -1) {
					if (cb) {
						appst.result = `${app.yellow} → http://${scfg.hostname}${nginxbuilt ? '' : ':' + scfg.port}${mount.cyan}`;
						appst.pid = ember.pid;
						cb(null, appst);
						cb = null;
					}
				}
			});
			ember.stderr.on('data', (buffer) => {
				console.log(buffer.toString());
				if (cb) {
					cb(null, `${app.yellow} ${'✗'.red} build failed.`);
					cb = null;
				}
			});
		})(app, cfg.mount);
	},
	buildHosts = function buildHosts () {
		const os = require('os');

		let subdomains = configuration.server;
		let hostname = subdomains.host;
		subdomains = subdomains.subdomains;
		/* istanbul ignore else */
		if (subdomains.indexOf('www') === -1) {
			subdomains.push('www');
		}
		let hostsdlocation = '';
		/* istanbul ignore next */
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
				utils.write(hostsdlocation, hostsd.replace(/\n+/igm, '\n'), true);
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
	.Action(async function (options) {
		process.env.port = options.port || 62626;
		options.production = options.production ? 'production' : 'development';
		process.env.NODE_ENV = options.production;
		const embercfg = configuration.ember;
		if (options.production === 'development') {
			buildHosts();
		}
		screen.start();
		if (options.nginx) {
			const getnginxpath = require('../functions/nginx').getnginxpath;
			await utils.copy(ProyPath(`${scfg.name}.conf`), path.join(await getnginxpath(), 'enabled_sites', `${scfg.name}.conf`), 1);
			nginxbuilt = await utils.shell('Restarting Nginx', ['nginx', '-s', 'reload'], process.cwd());
			nginxbuilt = nginxbuilt === 0;
		}
		if (options.production === 'development') {
			await CopyStatic();
			await CheckBundles();
			WatchFileToCopy();
			await WactchAndCompressImages();
		}
		await Events('pre', 'build');
		let ignoreemberdirs = [];
		return Events('pre', 'ember_build').then(() => {
			let index = 0;
			for (var emberAPP in embercfg) {
				ignoreemberdirs.push(path.join('public', emberAPP, '/'));
				if (options.production === 'development' && !options.skipBuild) {
					const configuration = {
						directory: embercfg[emberAPP].directory,
						mount: embercfg[emberAPP].mount,
						build: 'development',
						layout: embercfg[emberAPP].layout,
						title: embercfg[emberAPP].title,
						show: false
					};
					console.log(`    ${'->'.yellow} Building ${emberAPP.green} second plane`);
					building.push(preBuildEmber(emberAPP, configuration).then(() => {
						return serveEmber(emberAPP, embercfg[emberAPP], index).then((result) => {
							if (typeof result === 'object') {
								return postBuildEmber(emberAPP, configuration).then((file) => {
									let watcher = new Watch(ProyPath('public', configuration.directory, '**/*'), {
										persistent: true,
										ignoreInitial: true,
										alwaysStat: false,
										awaitWriteFinish: {
											stabilityThreshold: 1000,
											pollInterval: 100
										}
									});
									watching.push(watcher);
									let rebuildview = function () {
										postBuildEmber(emberAPP, configuration).then((f) => {
											livereload.reload();
										});
									};
									let fileSelector = function (file) {
										if (file.indexOf('index.html') > -1) {
											rebuildview();
										} else if (file.indexOf('.css')) {
											if (file.indexOf('.map') === -1) {
												livereload.reload(path.basename(file));
											}
										} else if (file.indexOf('.js')) {
											if (file.indexOf('.map') === -1) {
												livereload.reload(path.basename(file));
											}
										}
									};
									watcher
										.on('change', fileSelector);
									result.config = embercfg[emberAPP];
									return result;
								});
							} else {
								return {
									config: embercfg[emberAPP],
									log: false,
									result: result
								};
							}
						});
					}));
					index++;
				} else {
					building.push(Promise.resolve({
						config: embercfg[emberAPP],
						log: false,
						result: `${emberAPP.yellow} → ${embercfg[emberAPP].mount.cyan}`
					}));
				}
			}
			screen.line1(true);
			return Promise.all(building).then((reports) => {
				console.log('    Ember apps:');
				for (const report of reports) {
					report.log = true;
					console.log(`      ${report.result}`);
				}
				screen.line1();
				return Events('post', 'ember_build').then(() => {
					return reports.map((r) => r.pid);
				});
			});
		}).then((EmberPids) => {
			return Events('pre', 'serve').then(() => {
				return new Promise(function (resolve, reject) {
					let server = deamon(resolve, reject, EmberPids, nginxbuilt);
					process.once('SIGINT', function () {
						server.kill();
						resolve(0);
					});
				});
			});
		});
	});
