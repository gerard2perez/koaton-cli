/*eslint no-div-regex: 0*/
import * as path from 'upath';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as uglify from 'uglify-js';
import * as Concat from 'concat-with-sourcemaps';
import { sync as glob } from 'glob';
import * as co from 'co';

import * as Promise from 'bluebird';
import utils from '../utils';
import Command from '../Command';
import BundleItem from '../support/BundleItem';
import spin from '../spinner';

const spinner = spin();
const hasFileName = function (file, content) {
	const basename = path.trimExt(file);
	const ext = file.replace(basename, '');
	const hasher = crypto.createHash('sha1');
	hasher.update(content);
	const hash = hasher.digest('hex').slice(0, 20);
	return basename + '_' + hash + ext;
};
const compressImages = function (files, dest) {
	const imagemin = require('imagemin'),
		imageminMozjpeg = require('imagemin-mozjpeg'),
		imageminPngquant = require('imagemin-pngquant');

	return imagemin(files, dest, {
		plugins: [
			imageminMozjpeg({}),
			imageminPngquant({
				// quality: '70-90',
				verbose: true
			})
		]
	});
};
const buildcss = async function buildBundleCSS (target, bundle, development, onlypaths, logger) {
	let error = [];
	process.stdout.write(`Building ${target} `);
	let start = process.hrtime();
	const ITEM = scfg.bundles[target] || new BundleItem(target, []);
	ITEM.clear();

	utils.writeuseslog = logger;
	const less = require('less'),
		sass = Promise.promisify(require('node-sass').render),
		CssImporter = require('node-sass-css-importer')(),
		LessPluginCleanCSS = require('less-plugin-clean-css');

	const concat = new Concat(true, path.join('css', target + '.map'), '\n'),
		cleanCSSPlugin = new LessPluginCleanCSS({
			advanced: true
		}),
		watchinFiles = {};
	for (let index in bundle.content) {
		if (!development) {
			utils.rmdir(path.join('public', 'css', index + target));
		}
		let file = path.normalize(bundle.content[index]),
			basename = path.basename(file);
		if (file.indexOf('.less') > -1) {
			let content = await less.render(fs.readFileSync(file, 'utf-8'), {
				plugins: [cleanCSSPlugin],
				filename: file,
				compres: true,
				sourceMap: onlypaths ? {} : {
					outputSourceFiles: true,
					sourceMapBasepath: path.normalize(file.replace(basename, '')),
					sourceMapFileInline: development,
					sourceMapRootpath: '/' + basename
				}
			});
			if (development) {
				watchinFiles[index + target] = content.imports;
				watchinFiles[index + target].push(file);
				if (!onlypaths) {
					utils.write(path.join('public', 'css', index + target), content.css.toString(), 'utf-8', true);
				}
				ITEM.add(`/css/${index + target}`);
			} else {
				concat.add(basename, content.css, concat.map);
			}
		} else if (file.indexOf('.scss') > -1 || file.indexOf('.sass') > -1) {
			let content = await sass({
				sourceMap: onlypaths ? false : '/',
				sourceMapRoot: onlypaths ? undefined : '/' + target + '/',
				sourceMapContents: onlypaths ? undefined : true,
				sourceMapEmbed: onlypaths ? undefined : development,
				outputStyle: 'compressed',
				file: file,
				importer: [CssImporter]
			});
			if (development) {
				watchinFiles[index + target] = content.stats.includedFiles;
				if (!onlypaths) {
					utils.write(path.join('public', 'css', index + target), content.css.toString(), 'utf-8', true);
				}
				ITEM.add(`/css/${index + target}`);
			} else {
				concat.add(basename, content.css, concat.map);
			}
		} else if (file.indexOf('.css')) {
			watchinFiles[index + target] = glob(file);
			if (watchinFiles[index + target].length === 0) {
				error.push(`${__nok.red}   Pattern ${file} ${'not found'.red}`);
			}
			const concatCSS = new Concat(true, path.join('css', index + target + '.css'), '\n');
			if (!development || !onlypaths) {
				for (const url of watchinFiles[index + target]) {
					concatCSS.add(target, fs.readFileSync(url));
				}
			}
			if (development && !onlypaths) {
				utils.write(ProyPath('public', 'css', index + target), concatCSS.content, 'utf-8', true);
				ITEM.add(`/css/${index + target}`);
			} else if (!development) {
				concat.add(basename, concatCSS.content);
			}
		}
		scfg.bundles.remove(ITEM).add(ITEM);
	}
	if (!onlypaths) {
		if (!development) {
			const file = hasFileName(target, concat.content.toString());
			utils.write(
				path.join('public', 'css', file),
				concat.content.toString(), 'utf-8', true);

			ITEM.clear().add(`/css/${file}`);
		}
	}
	utils.writeuseslog = undefined;
	let [seconds, nanoseconds] = process.hrtime(start);
	console.log(`${(seconds * 1000) + Math.ceil(nanoseconds / 1e6)} ms`);
	if (error.length > 0) {
		console.log(error.join('\n'));
	}
	return watchinFiles;
};
const buildjs = function buildJS (target, bundle, development, onlypaths, logger) {
	let error = [];
	return new Promise(function (resolve) {
		process.stdout.write(`Building ${target} `);
		let start = process.hrtime();
		const ITEM = scfg.bundles[target] || new BundleItem(target, []);
		ITEM.clear();
		utils.writeuseslog = logger;
		let AllFiles = [];
		for (const pattern of bundle) {
			let bundle = glob(ProyPath(pattern));
			if (bundle.length === 0) {
				error.push(`${__nok.red}   Pattern ${pattern} ${'not found'.red}`);
			}
			AllFiles = AllFiles.concat(bundle);
		}
		process.stdout.write(`(${AllFiles.length} files) `);
		if (onlypaths) {
			return AllFiles;
		}
		let result = uglify.minify(AllFiles, {
			mangle: false,
			outSourceMap: onlypaths ? false : ' /js/' + target + '.map',
			sourceMapIncludeSources: onlypaths ? false : development,
			sourceRoot: '/' + path.changeExt(target, '.min.js'),
			compress: {
				dead_code: true,
				sequences: true,
				unused: true
			}
		});
		if (!onlypaths) {
			const file = development ? path.changeExt(target, '.min.js') : hasFileName(target, result.code.toString());
			utils.write(path.join('public', 'js', file), result.code, {
				encoding: 'utf-8'
			}, true);
			if (development) {
				fs.writeFileSync(path.join('public', 'js', target + '.map'), result.map, 'utf8');
			}

			ITEM.add('/js/' + file);
		}
		utils.writeuseslog = undefined;
		scfg.bundles.remove(ITEM).add(ITEM);
		let [seconds, nanoseconds] = process.hrtime(start);
		console.log(`${(seconds * 1000) + Math.ceil(nanoseconds / 1e6)} ms`);
		if (error.length > 0) {
			console.log(error.join('\n'));
		}
		resolve(AllFiles);
	});
};
const getinflections = async function getInflections (appName, show = true) {
	const inflections = require(path.join(process.cwd(), 'config', 'inflections.js')),
		irregular = (inflections.plural || [])
		.concat(inflections.singular || [])
		.concat(inflections.irregular || []),
		uncontable = (inflections.uncountable || []).map((inflection) => {
			return `/${inflection}/`;
		});
	utils.render(TemplatePath('ember_apps', 'inflector.js'), ProyPath('ember', appName, 'app', 'initializers', 'inflector.js'), {
		irregular: JSON.stringify(irregular),
		uncontable: JSON.stringify(uncontable)
	}, show ? 1 : null);
};
const prebuildember = async function preBuildEmber (application, options) {
	const emberProyectPath = ProyPath('ember', application);
	options.mount = path.join('/', options.mount || '', '/');
	options.mount = options.mount.replace(/\\/igm, '/');
	await utils.mkdir(ProyPath('ember', application, 'app', 'adapters'), -1);
	await getInflections(application, options.show);
	let adapter = configuration.ember[application].adapter;
	if (adapter.indexOf('http://') !== 0) {
		adapter = 'http://' + adapter;
	}
	let raw = fs.readFileSync(ProyPath('ember', application, 'app', 'adapters', 'application.js'), 'utf-8');
	var exp = (/host: (.*),?/i).exec(raw);
	if (raw.indexOf('K:custom-adapter') === -1) {
		fs.writeFileSync(ProyPath('ember', application, 'app', 'adapters', 'application.js'), raw.replace(exp[1], `'${adapter}'`));
	}
	let embercfg = await utils.read(path.join(emberProyectPath, 'config', 'environment.js'), {
		encoding: 'utf-8'
	});
	embercfg = embercfg.replace(/baseURL: ?'.*',/, `baseURL: '${options.mount}',`);
	embercfg = embercfg.replace(/rootURL: ?'.*',/, `rootURL: '${options.mount}',`);
	return utils.write(path.join(emberProyectPath, 'config', 'environment.js'), embercfg, 0);
};
const buildember = async function buildEmber (application, options) {
	await utils.mkdir(path.join(process.cwd(), 'public', options.directory));
	let env = process.env.NODE_ENV;
	let res = (await utils.shell(
		`Building ... ${application.yellow}->${options.mount.green}`, [
			'ember',
			'build',
			'--environment',
			options.build,
			'-o', path.join('..', '..', 'public', options.directory)
		],
		ProyPath('ember', application)
	));
	process.env.NODE_ENV = env;
	return !res;
};
const postbuildember = async function postBuildEmber (application, options) {
	const emberinternalname = require(ProyPath('ember', application, 'package.json')).name;
	let text = await utils.read(ProyPath('public', options.directory, 'index.html'), {
			encoding: 'utf-8'
		}),
		indextemplate = await utils.read(TemplatePath('ember_apps', 'index.handlebars'), 'utf-8'),
		meta = new RegExp(`<meta ?name="${emberinternalname}.*" ?content=".*" ?/>`);

	const links = new RegExp('<link rel="stylesheet" href=".*?assets/.*.css.*>', 'gm');
	const scripts = new RegExp('<script src=".*?assets/.*.js.*></script>', 'gm');
	const transformlinks = function transformlinks (text, expresion) {
		return text.match(expresion).join('\n')
					.replace(/="[^=]*?assets/igm, `="/${options.directory}/assets`);
	};
	text = utils.compile(indextemplate, {
		title: options.title || application,
		layout: options.layout || 'main',
		path: options.directory,
		mount: options.mount,
		app_name: application,
		meta: text.match(meta)[0],
		cssfiles: transformlinks(text, links),
		jsfiles: transformlinks(text, scripts)
	});
	for (const file of glob(ProyPath('public', options.directory, '*.*'))) {
		fs.unlink(file);
	}
	await utils.mkdir(ProyPath('views', 'ember_apps'), -1);
	return utils.write(ProyPath('views', 'ember_apps', `${options.directory}.handlebars`), text, 1);
};

const buildCSS = co.wrap(buildcss);
const buildJS = co.wrap(buildjs);
const getInflections = co.wrap(getinflections);
const preBuildEmber = co.wrap(prebuildember);
const buildEmber = co.wrap(buildember);
const postBuildEmber = co.wrap(postbuildember);
export {
	getInflections,
	compressImages,
	postBuildEmber,
	preBuildEmber,
	buildEmber,
	buildCSS,
	buildJS
};
export default (new Command(
	__filename,
	'Make bundles of your .js .scss .css files and output to public folder.\n   See ./config/bundles.js'))
	.Options([
		['-p', '--prod', 'builds for production']
	])
	.Action(async function (options) {
		options.prod = options.prod ? 'production' : 'development';
		process.env.NODE_ENV = options.prod;
		await utils.copy(path.join('assets', 'favicon.ico'), path.join('public', 'favicon.ico'), {
			encoding: 'binary'
		});
		if (Object.keys(configuration.bundles).length === 0) {
			console.log('Nothing to compile.');
		} else {
			await utils.mkdir(ProyPath('public', 'js'), -1);
			await utils.mkdir(ProyPath('public', 'css'), -1);
			for (let bundle of scfg.bundles) {
				for (let compiledfile of bundle) {
					utils.rmdir(path.join('public', path.normalize(compiledfile)));
				}
			}
			console.log(`Updating bundles (env: ${options.prod})`);
			for (const key in configuration.bundles) {
				if (key.indexOf('.css') > -1) {
					await buildCSS(key, configuration.bundles[key], options.prod === 'development');
				} else if (key.indexOf('.js') > -1) {
					await buildJS(key, configuration.bundles[key], options.prod === 'development');
				}
			}
			for (const postember of glob('events/pre_ember_build.js').concat(glob('koaton_modules/**/pre_ember_build.js'))) {
				let guest = path.dirname(postember);
				await require(ProyPath(postember)).default(ProyPath(guest, '..'));
			}
			const embercfg = configuration.ember;
			for (const emberAPP in embercfg) {
				let configuration = {
					directory: embercfg[emberAPP].directory,
					mount: embercfg[emberAPP].mount,
					build: 'development',
					layout: embercfg[emberAPP].layout
				};
				await preBuildEmber(emberAPP, configuration);
				await buildEmber(emberAPP, configuration);
				await postBuildEmber(emberAPP, configuration);
			}

			for (const postember of glob('events/post_ember_build.js').concat(glob('koaton_modules/**/post_ember_build.js'))) {
				let guest = path.dirname(postember);
				await require(ProyPath(postember)).default(ProyPath(guest, '..'));
			}
			spinner.start(50, 'Compressing Images', undefined, process.stdout.columns);
			await compressImages([path.join('assets', 'img', '*.{jpg,png}')], path.join('public', 'img'));
			spinner.end('Images Compressed'.green);
		}
	});
