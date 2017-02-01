import * as spawn from 'cross-spawn';
import { watch as Watch } from 'chokidar';
import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as co from 'co';
import screen from '../welcome';
import Command from '../Command';
import utils from '../utils';
import spin from '../spinner';
import livereload from '../utils/livereload';
import CheckBundles from '../support/CheckBundles';
import WatchFileToCopy from '../support/WatchFileToCopy';
import CopyStatic from '../support/CopyStatic';
import deamon from '../deamon';

let promises = [],
	watching = [],
	building = [],
	buildcmd = null;
const deleted = function (file) {
		try {
			fs.unlinkSync(file.replace('assets', 'public'));
		} catch (e) {
			console.log(file.replace('assets', 'public'));
		}
		livereload.reload(file);
	},
	compress = function (file) {
		buildcmd.compressImages([file], file.replace(path.basename(file), '').replace('assets', 'public')).then(() => {
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
		const spinner = spin();
		spinner.start(50, '    -> Compressing Images'.green, undefined, process.stdout.columns);
		watching.push(watcher);
		watcher
			.on('change', compress)
			.on('unlink', deleted)
			.on('add', compress);
		let compres = co.wrap(buildcmd.compressImages);
		return compres([path.join('assets', 'img', '*.{jpg,png}')], path.join('public', 'img')).then(() => {
			spinner.end(`    -> Images Compressed ${__ok.green}`);
		});
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
						appst.result = `${app.yellow} → http://${scfg.hostname}:${scfg.port}${mount.cyan}`;
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
	seedKoatonModules = function () {
		fs.access(ProyPath('koaton_modules'), fs.RF_OK | fs.W_OK, (err) => {
			if (!err) {
				readDir(ProyPath('koaton_modules')).forEach((Module) => {
					requireNoCache(ProyPath('koaton_modules', Module, 'koaton_prebuild.js'), () => {
					})();
				});
			}
		});
	},
	koatonModulesPostBuild = function () {
		let promises = [];
		fs.access(ProyPath('koaton_modules'), fs.RF_OK | fs.W_OK, (err) => {
			if (!err) {
				readDir(ProyPath('koaton_modules')).forEach((Module) => {
					console.log('start post building');
					promises.push(Events(`koaton_modules/${Module}/events`, 'post', 'ember_build'));
					console.log('end post building');
				});
			}
		});
		return Promise.all(promises);
	},
	TriggerEvent = Events.bind(null, 'events'),
	buildHosts = function buildHosts () {
		const os = require('os');

		let subdomains = configuration.server;
		let hostname = subdomains.hostname;
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
			let hostsd = fs.readFileSync(hostsdlocation, 'utf-8');
			for (const subdomain in subdomains) {
				let entry = '127.0.0.1\t' + subdomains[subdomain] + '.' + hostname;
				if (hostsd.indexOf(entry) === -1) {
					hostsd += '\n' + entry;
				}
			}
			utils.write(hostsdlocation, hostsd.replace(/\n+/igm, '\n'), true);
		}
	};
export default (new Command(__filename, 'Runs your awsome Koaton applicaction using nodemon'))
	.Options([
		['-s', '--skip-build', ''],
		['-p', '--production', 'Runs with NODE_ENV = production'],
		['--port', '--port <port>', 'Run on the especified port (port 80 requires sudo).']
	])
	.Action(function (options) {
		process.env.port = options.port || 62626;
		options.production = options.production ? 'production' : 'development';
		process.env.NODE_ENV = options.production;
		buildcmd = require('./build');
		const embercfg = configuration.ember;
		if (options.production === 'development') {
			buildHosts();
		}
		screen.start();
		if (options.production === 'development') {
			promises.push(CopyStatic());
			CheckBundles();
			WatchFileToCopy();
			promises.push(WactchAndCompressImages());
		}
		promises.push(TriggerEvent('pre', 'serve'));
		promises.push(seedKoatonModules());
		return Promise.all(promises).then(() => {
			return TriggerEvent('pre', 'serve').then(() => {
				let ignoreemberdirs = [];
				return TriggerEvent('pre', 'ember_build').then(() => {
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
							building.push(buildcmd.preBuildEmber(emberAPP, configuration).then(() => {
								return serveEmber(emberAPP, embercfg[emberAPP], index).then((result) => {
									if (typeof result === 'object') {
										return buildcmd.postBuildEmber(emberAPP, configuration).then(() => {
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
							console.log(`      ${report.result}`);
						}
						screen.line1();
						return TriggerEvent('post', 'ember_build').then(() => {
							return koatonModulesPostBuild().then(() => {
								return reports.map((r) => r.pid);
							});
						});
					});
				});
			}).then((EmberPids) => {
				return new Promise(function (resolve, reject) {
					let server = deamon(resolve, reject, EmberPids);
					process.once('SIGINT', function () {
						server.kill();
						resolve(0);
					});
				});
			});
		});
	});
