import { write, mkdir, shell, compile, render, challenge } from '../utils';
import { sync as glob } from 'glob';
import { readFile, unlink, exists } from 'fs-extra';
import { join, basename } from 'path';
import * as spawn from 'cross-spawn';
import { watch as Watch } from 'chokidar';
import * as detect from 'detect-port';

// TODO: please check when the proccess failed.
let index = 0;
export default class EmberBuilder {
	getInflections (show = true) {
		const inflections = require(join(process.cwd(), 'config', 'inflections.js')).default,
			irregular = (inflections.plural || [])
				.concat(inflections.singular || [])
				.concat(inflections.irregular || []),
			uncontable = (inflections.uncountable || []).map((inflection) => {
				return `/${inflection}/`;
			});
		render(TemplatePath('ember_apps', 'inflector.js'), this.path('app', 'initializers', 'inflector.js'), {
			irregular: JSON.stringify(irregular),
			uncontable: JSON.stringify(uncontable)
		}, show ? 1 : null);
	}
	constructor (app, env, config = {}) {
		this.index = index++;
		this.name = app;
		this.env = env;
		this.directory = config.directory || app.toLowerCase().replace(/ /g, '_').replace(/-/g, '_').replace(/_+/g, '_');
		this.mount = join('/', config.mount || '', '/').replace(/\\/igm, '/');
		this.adapter = config.adapter;
		this.subdomain = config.subdomain;
		this.layout = config.layout;
	}
	path (...route) {
		return ProyPath('ember', this.name, ...route);
	}
	async create (options) {
		if (await challenge(this.path(), `destination ${this.path().yellow} is not empty, continue?`, options.force)) {
			if (await exists(this.path())) {
				await unlink(this.path());
			}
			await shell(`Installing ${this.name.green}`, ['ember', 'new', this.name, '-dir', this.path()], process.cwd());
			await mkdir(this.path('app', 'initializers'));
			await this.getInflections(true);
			return false;
		} else {
			return true;
		}
	}
	async prebuild () {
		await mkdir(this.path('app', 'adapters'), -1);
		this.getInflections(false);
		let adapter = this.adapter;
		let protocol = configuration.server.https ? 'https' : 'http';
		if (adapter.indexOf('http://') !== 0) {
			adapter = adapter || `${protocol}:\\\\${configuration.server.host}:${configuration.server.port}`;
		}
		let raw = await readFile(this.path('app', 'adapters', 'application.js'), 'utf-8');
		let exp = (/host: (.*),?/i).exec(raw);
		write(this.path('app', 'adapters', 'application.js'), raw.replace(exp[1], `'${adapter}',`));
		let embercfg = await readFile(this.path('config', 'environment.js'), {
			encoding: 'utf-8'
		});
		embercfg = embercfg.replace(/baseURL: ?'.*',/, `baseURL: '${this.mount}',`);
		embercfg = embercfg.replace(/rootURL: ?'.*',/, `rootURL: '${this.mount}',`);
		return write(this.path('config', 'environment.js'), embercfg, 0);
	}
	async postbuild () {
		const emberinternalname = require(this.path('package.json')).name;
		let text = await readFile(ProyPath('public', this.directory, 'index.html'), { encoding: 'utf-8' }),
			indextemplate = await readFile(TemplatePath('ember_apps', 'index.handlebars'), 'utf-8'),
			meta = new RegExp(`<meta ?name="${emberinternalname}.*" ?content=".*" ?/>`);
		const links = new RegExp('<link.*rel="stylesheet" href=".*?assets/.*.css.*>', 'gm');
		const scripts = new RegExp('<script src=".*?assets/.*.js.*></script>', 'gm');
		const transformlinks = (text, expresion) => {
			return text.match(expresion).join('\n')
				.replace(/="[^=]*?assets/igm, `="/${this.directory}/assets`);
		};
		const title = (/<title>(.*)<\/title>/gm).exec(text)[1];
		let attributes = (/<.*?body(.*)>/g).exec(text)[1];
		/* istanbul ignore else */
		if (attributes) {
			attributes = `{{#content "bodyatrributes"}}\n\t\t${attributes}\n\t{{/content}}\n`;
		}
		let body = (/<.*body.*>((.|\r|\n)*)<\/body>/m).exec(text)[1];
		body.match(scripts).forEach(script => {
			body = body.replace(script, '');
		});
		text = compile(indextemplate, {
			body: body.trim(),
			bodyatrributes: attributes || /* istanbul ignore next */'',
			title: title.trim(),
			layout: this.layout || /* istanbul ignore next */'main',
			path: this.directory,
			mount: this.mount,
			app_name: this.name,
			meta: text.match(meta)[0],
			cssfiles: transformlinks(text, links),
			jsfiles: transformlinks(text, scripts)
		});
		for (const file of glob(ProyPath('public', this.directory, '*.*'))) {
			await unlink(file);
		}
		await mkdir(ProyPath('views', 'ember_apps'), null);
		return write(ProyPath('views', 'ember_apps', `${this.directory}.handlebars`), text);
	}
	async compile () {
		await mkdir(join(process.cwd(), 'public', this.directory), -1);
		let env = process.env.NODE_ENV;
		let res = (await shell(
			`Building ${this.name.yellow} -> ${this.subdomain.green}.${configuration.server.host}:${scfg.port}${this.mount.green}`, [
				'ember',
				'build',
				'--environment',
				this.env,
				'-o', join('..', '..', 'public', this.directory)
			],
			this.path()
		));
		// console.log('================================', res);
		process.env.NODE_ENV = env;
		return !res;
	}
	async live (nginxbuilt, live) {
		let storebuffer = '';
		return new Promise(async resolve => {
			let appst = { log: false, result: '', success: false, pid: null, process: null };
			let port = await detect(4200);
			const ember = spawn('ember', ['serve', '-lr', live ? 'true' : 'false', '--output-path', join('..', '..', 'public', this.directory), '--port', port + this.index], {
				cwd: this.path(),
				shell: true
			});
			appst.pid = ember.pid;
			appst.process = ember;
			ember.stderr.on('data', (buffer) => {
				if (appst.log) {
					console.log(buffer.toString());
				}
				storebuffer += buffer.toString();
				if (storebuffer.indexOf('SyntaxError') > -1 || storebuffer.indexOf('File not found') > -1) {
					appst.buffer = storebuffer;
					appst.result = `${this.name.yellow} ${__nok.red} build failed.`;
					resolve(appst);
				}
			});
			ember.stdout.on('data', (buffer) => {
				storebuffer += buffer.toString();
				if (appst.log) {
					console.log(buffer.toString());
				} else if (buffer.toString().indexOf('Build successful') > -1) {
					appst.success = true;
					appst.result = `${__ok.green} ${this.name.yellow} → http://${scfg.hostname}${nginxbuilt ? '' : ':' + configuration.server.port}${this.mount.cyan}`;
					resolve(appst);
				}
			});

			// ember.stdout.on('close', onClose);
			// ember.stderr.on('close', onClose);
			ember.on('close', (code) => {
				if (code !== 0) {
					appst.buffer = storebuffer;
					appst.result = `${this.name.yellow} ${__nok.red} build failed.`;
					resolve(appst);
				}
			});
		});
	}
	async build () {
		await this.prebuild();
		await this.compile();
		await this.postbuild();
	}
	async serve (nginxbuilt, live = true) {
		await this.prebuild();
		let result = await this.live(nginxbuilt, live);
		if (!result.success) {
			result.process.kill();
		} else {
			await this.postbuild();
		}
		return result;
	}
	createWatcher (reload) {
		let watcher = new Watch(ProyPath('public', this.directory, '**/*'), {
			// ignored: ,
			persistent: true,
			ignoreInitial: true,
			alwaysStat: false,
			awaitWriteFinish: {
				stabilityThreshold: 1000,
				pollInterval: 100
			}
		});
		// let rebuildview = function () {
		// 	postBuildEmber(emberAPP, configuration).then((f) => {
		// 		reload();
		// 	});
		// };
		let fileSelector = async (file) => {
			console.log('fileSelector', file);
			if (file.indexOf('index.html') > -1) {
				await this.postbuild();
				// reload();
				// rebuildview();
			} else if (file.indexOf('.css') > -1) {
				if (file.indexOf('.map') === -1) {
					reload(basename(file));
				}
			} else if (file.indexOf('.js') > -1 && file.indexOf('testem.js') === -1) {
				if (file.indexOf('.map') === -1) {
					reload(basename(file));
				}
			}
		};
		watcher.on('change', fileSelector).on('add', fileSelector);
	}
	get version () {
		return require(this.path('package.json')).devDependencies['ember-cli'];
	}
}
