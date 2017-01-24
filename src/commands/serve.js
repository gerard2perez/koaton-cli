import * as spawn from 'cross-spawn';
import * as chokidar from 'chokidar';
import * as nodemon from 'nodemon';
import notifier from '../support/Notifier';
import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as co from 'co';
import screen from '../welcome';
import * as ModelManager from '../modelmanager';
import Command from '../Command';
import utils from '../utils';
import spin from '../spinner';
import livereload from '../utils/livereload';
import CheckBundles from '../support/CheckBundles';
import WatchFileToCopy from '../support/WatchFileToCopy';

const Watch = chokidar.watch;
let watching = [],
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
	WactchAndCompressImages = async function WactchAndCompressImages (watcher) {
		const spinner = spin();

		spinner.start(50, 'Compressing Images'.green, undefined, process.stdout.columns);
		watching.push(watcher);
		await buildcmd.compressImages([path.join('assets', 'img', '*.{jpg,png}')], path.join('public', 'img'));
		watcher
			.on('change', compress)
			.on('unlink', deleted)
			.on('add', compress);
		spinner.end('Images Compressed ' + '✓'.green);
	},
	serveEmber = function (app, cfg, index) {
		return Promise.promisify((...args) => {
			let [app, mount, cb] = args;
			console.log(args);
			let appst = {
				log: false,
				result: ''
			};
			const ember = spawn('ember', ['serve', '-lr', 'false', '--output-path', path.join('..', '..', 'public', cfg.directory), '--port', 4200 + index], {
				cwd: ProyPath('ember', app),
				shell: true
			});
			ember.stdout.on('data', (buffer) => {
				if (appst.log) {
					console.log(buffer.toString());
				} else if (buffer.toString().indexOf('Build successful') > -1) {
					if (cb) {
						appst.result = `${app.yellow} → http://${scfg.hostname}:${scfg.port}${mount.cyan}`;

						// let watcher = new chokidar.watch(ProyPath('public', app, '/'), {
						// 	ignored:[
						// 		'**/adapters/application.js',
						//
						// 	],
						// 	persistent: true,
						// 	ignoreInitial: true,
						// 	alwaysStat: false,
						// 	awaitWriteFinish: {
						// 		stabilityThreshold: 2000,
						// 		pollInterval: 100
						// 	}
						// });
						// setTimeout(function(){
						// 	console.log('w',watcher.getWatched());
						// },1000);
						// //watcher.unwatch('new-file*');
						// const rebuild = function() {
						// 	co(async function(){
						// 		await TriggerEvent('post', 'ember_build');
						// 		await koatonModulesPostBuild();
						// 	});
						// 	livereload.reload();
						// 	notifier.notify({
						// 		title: 'Koaton',
						// 		message: `EmberApp ${app} changed ...`,
						// 		icon: path.join(__dirname, 'koaton.png'),
						// 		sound: 'Basso'
						// 	});
						// }
						// watcher
						// 	.on('change', rebuild)
						// 	.on('unlink', rebuild)
						// 	.on('add', rebuild)
						// 	.on('unlinkDir', rebuild);
						cb(null, appst);
						cb = null;
					}
				}
			});
			ember.stderr.on('data', (buffer) => {
				if (cb) {
					cb(null, `${app.yellow} ${'✗'.red} build failed.`);
					cb = null;
				}
				console.log(buffer.toString());
			});
		})(app, cfg.mount);
	},
	seedKoatonModules = function () {
		fs.access(ProyPath('koaton_modules'), fs.RF_OK | fs.W_OK, (err) => {
			if (!err) {
				readDir(ProyPath('koaton_modules')).forEach((Module) => {
					requireNoCache(ProyPath('koaton_modules', Module, 'koaton_prebuild.js'), () => {})();
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
					promises.push(co(async function () {
						await Events(`koaton_modules/${Module}/events`, 'post', 'ember_build');
					}));
					console.log('end post building');
				});
			}
		});
		return Promise.all(promises);
	},
	WatchModels = function WatchModels () {
		const addmodelfn = function addmodelfn (file) {
			let model = path.basename(file).replace('.js', '');
			let Model = ModelManager(model, requireNoCache(file)).toMeta();
			scfg.database.models[model] = Model.model;
			if (Model.relations.length > 0) {
				scfg.database.relations[model] = Model.relations;
			}
		};
		let watchmodels = new Watch(ProyPath('models', '**'), {
			persistent: true,
			ignoreInitial: true,
			alwaysStat: false,
			awaitWriteFinish: {
				stabilityThreshold: 250,
				pollInterval: 100
			}
		});
		watchmodels.on('add', addmodelfn).on('change', addmodelfn).on('unlink', (file) => {
			let model = path.basename(file).replace('.js', '');
			delete scfg.database.models[model];
			delete scfg.database.relations[model];
			let deletions = [];
			const check = function check (rel) {
				if (scfg.database.relations[idx][rel].indexOf(` ${model} `) > -1) {
					deletions.push({
						idx: idx,
						rel: rel
					});
				}
			};
			for (var idx in scfg.database.relations) {
				Object.keys(scfg.database.relations[idx]).forEach(check);
			}
			deletions.forEach((obj) => {
				delete scfg.database.relations[obj.idx][obj.rel];
			});
		});
	},
	TriggerEvent = async function TriggerEvent (event, phase) {
		await Events('events', event, phase);
	},
	buildHosts = async function buildHosts () {
		const os = require('os');

		let subdomains = configuration.server;
		let hostname = subdomains.hostname;
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
				console.log('your os is not detected, hosts files won\'t be updated'.red);
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
	.Action(async function (options) {
		process.env.port = options.port || 62626;
		options.production = options.production ? 'production' : 'development';
		process.env.NODE_ENV = options.production;
		buildcmd = require('./build');

		const embercfg = configuration.ember,
			env = {
				welcome: true,
				NODE_ENV: process.env.NODE_ENV,
				port: process.env.port
			};
		if (options.production === 'development') {
			await buildHosts();
		}
		screen.start();
		if (options.production === 'development') {
			await require('./build').copystatic();
			await WactchAndCompressImages(new Watch(path.join('assets', 'img'), {
				persistent: true,
				ignoreInitial: true,
				alwaysStat: false,
				awaitWriteFinish: {
					stabilityThreshold: 1000,
					pollInterval: 100
				}
			}));
			await CheckBundles(chokidar.watch);
			WatchModels();
			WatchFileToCopy();
		}
		await TriggerEvent('pre', 'serve');
		seedKoatonModules();
		return new Promise(function (resolve) {
			nodemon({
				ext: '*',
				quiet: false,
				delay: 300,
				ignore: [
					'commands/',
					'/views/emberAPPs/*.*',
					'/node_modules/*.*',
					'/koaton_modules/*.*',
					'/ember/*.*',
					'/assets/*.*',
					'/models/*.*',
					'/public/',
					'/config/bundles.js',
					'*.tmp',
					'*.json'
				],
				verbose: true,
				script: 'app.js',
				env: env,
				stdout: true
			})
			.once('start', function () {
				co(async function () {
					await TriggerEvent('pre', 'serve');
					screen.line1(true);
					let ignoreemberdirs = [];
					await TriggerEvent('pre', 'ember_build');
					for (var emberAPP in embercfg) {
						ignoreemberdirs.push(path.join('public', emberAPP, '/'));
						if (options.production === 'development' && !options.skipBuild) {
							const configuration = {
								directory: embercfg[emberAPP].directory,
								mount: embercfg[emberAPP].mount,
								build: 'development',
								layout: embercfg[emberAPP].layout,
								title: embercfg[emberAPP].title
							};
							console.log(`Building ${emberAPP.green} second plane`);
							try {
								await buildcmd.preBuildEmber(emberAPP, configuration);
								let b = serveEmber(emberAPP, embercfg[emberAPP]);
								building.push(b);
								await b;
								await buildcmd.postBuildEmber(emberAPP, configuration);
							} catch (e) {
								console.log(e);
							}
						} else {
							building.push(Promise.resolve({
								log: false,
								result: `${emberAPP.yellow} → ${embercfg[emberAPP].mount.cyan}`
							}));
						}
					}
					screen.line1(true);
				}).then(() => {
					Promise.all(building).then((reports) => {
						if (reports.length > 0) {
							console.log('   Ember apps:');
							console.log('     ' + reports.map((r) => {
								return r.result;
							}).join('\n     '));
						}
						for (let idx in reports) {
							reports[idx].log = true;
						}
						screen.line1();
						co(async function () {
							await TriggerEvent('post', 'ember_build');
							await koatonModulesPostBuild();
						});
					});
					notifier('Koaton', `Serving http://${scfg.hostname}:${scfg.port}`);
					setTimeout(function () {
						livereload.reload();
					}, 1000);
				});
			}).on('restart', function (a, b, c) {
				console.log('restart', a, b, c);
				setTimeout(function () {
					livereload.reload();
				}, 1000);
				notifier('Koaton', 'restarting server...', 'Basso');
			}).on('crash', (e) => {
				console.log('CRASH', e);
				nodemon.emit('exit');
				resolve(1);
			});
			const exitHandler = function () {
				nodemon.emit('exit');
				resolve(0);
			};
			process.once('SIGINT', exitHandler);
		});
	});
