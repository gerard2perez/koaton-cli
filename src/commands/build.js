/*eslint no-div-regex: 0*/
import * as path from 'upath';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as uglify from 'uglify-js';
import * as Concat from 'concat-with-sourcemaps';
import { sync as glob } from 'glob';
import * as co from 'co';
import copystatic from '../support/CopyStatic';
import {postBuildEmber, preBuildEmber, buildEmber} from '../functions/emberBuilder';
import * as Promise from 'bluebird';
import utils from '../utils';
import Command from 'cmd-line/lib/Command';
import BundleItem from '../support/BundleItem';
// import spin from '../spinner';
import * as nginx from '../functions/nginx';
import buildImages from '../functions/imageCompressor';

// const spinner = spin();
const hasFileName = function (file, content) {
	const basename = path.trimExt(file);
	const ext = file.replace(basename, '');
	const hasher = crypto.createHash('sha1');
	hasher.update(content);
	const hash = hasher.digest('hex').slice(0, 20);
	return basename + '_' + hash + ext;
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
			watchinFiles[index + target] = glob(ProyPath(file));
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

const buildCSS = co.wrap(buildcss);
const buildJS = co.wrap(buildjs);

export {
	buildCSS,
	buildJS
};
async function buildNginx () {
	let nginxpath = await nginx.getnginxpath();
	let conf = fs.readFileSync(nginxpath + 'nginx.conf', 'utf-8');
	if (conf.indexOf('include enabled_sites/*') === -1) {
		conf = conf.replace(/http ?\{/igm, 'http {\n\tinclude enabled_sites/*.conf;');
		fs.writeFileSync(nginxpath + 'nginx.conf', conf);
		console.log(`   ${'updated'.cyan}: nginx.conf`);
		await utils.mkdir(nginxpath + 'enabled_sites');
	}
	let serverTemplate = fs.readFileSync(TemplatePath('subdomain.conf'), 'utf-8');
	let nginxConf = fs.readFileSync(TemplatePath('server.conf'), 'utf-8');
	nginxConf = utils.compile(nginxConf, {
		hostname: scfg.host,
		port: scfg.port
	});
	let childsubdomains = glob('koaton_modules/**/config/server.js').map((c) => {
		return require(ProyPath(c)).default.subdomains;
	});
	childsubdomains.push(configuration.server.subdomains);
	let allsubdomains = [].concat.apply([], childsubdomains).filter((f, i, a) => a.indexOf(f) === i);
	for (const idx in allsubdomains) {
		nginxConf += utils.compile(serverTemplate, {
			subdomain: allsubdomains[idx],
			hostname: scfg.host,
			port: scfg.port
		});
	}
	let res = utils.write(ProyPath(`${scfg.name}.conf`), nginxConf);
	console.log(`   ${res !== null ? __ok.green : __nok.red} Built ${scfg.name}.conf`);
}
async function buildApps () {
	if (Object.keys(configuration.ember).length === 0) return 0;
	await Events('pre', 'ember_build');
	for (const emberAPP in configuration.ember) {
		let cfg = {
			directory: configuration.ember[emberAPP].directory,
			mount: configuration.ember[emberAPP].mount,
			build: scfg.env,
			layout: configuration.ember[emberAPP].layout,
			show: false
		};
		await preBuildEmber(emberAPP, cfg);
		await buildEmber(emberAPP, cfg);
		await postBuildEmber(emberAPP, cfg);
	}
	await Events('post', 'ember_build');
}
async function buildBundles () {
	if (Object.keys(configuration.bundles).length === 0) {
		console.log(`   ${__ok.green} No bundles defined`);
	} else {
		await utils.mkdir(ProyPath('public', 'js'), -1);
		await utils.mkdir(ProyPath('public', 'css'), -1);
		for (let bundle of scfg.bundles) {
			for (let compiledfile of bundle) {
				utils.rmdir(path.join('public', path.normalize(compiledfile)));
			}
		}
		console.log(`Updating bundles (env: ${scfg.env})`);
		for (const key in configuration.bundles) {
			if (key.indexOf('.css') > -1) {
				await buildCSS(key, configuration.bundles[key], scfg.env === 'development');
			} else if (key.indexOf('.js') > -1) {
				await buildJS(key, configuration.bundles[key], scfg.env === 'development');
			}
		}
	}
}
// async function buildImages () {
// 	spinner.start(50, 'Compressing Images', undefined, process.stdout.columns);
// 	let subforlders = glob(ProyPath('assets', 'img', '**', '/')); // .map((f) => path.join(f, '*.{jpg,png}'));
// 	let all = [];
// 	for (const folder of subforlders) {
// 		all.push(imageCompressor([path.join(folder, '*.{jpg,png}')], path.join('public', folder.replace(ProyPath('assets'), ''))));
// 	}
// 	return Promise.all(all).then((res) => {
// 		spinner.end(`   ${__ok.green} (${res.reduce((a, b) => a + b)}) Images Compressed`);
// 	});
// }
export default (new Command(
	__filename,
	'Bulds whatever your system needs to build. (bundles, nginxConf, emberapps)'))
	.Options([
		['--nginx', '--nginx', 'Builds nginx config only'],
		['--bundles', '--bundles', 'Builds bundles only'],
		['--apps', '--apps', 'Builds ember apps only'],
		['--images', '--images', 'Comprees all the images'],
		['--static', '--static', 'Copy Static files']
	])
	.Action(async function (options) {
		options.all = !(options.nginx || options.bundles || options.apps || options.images || options.static);
		if (options.nginx || options.all) {
			await buildNginx();
		}
		if (options.bundles || options.all) {
			await buildBundles();
		}
		if (options.apps || options.all) {
			await buildApps();
		}
		if (options.images || options.all) {
			await buildImages();
		}
		if (options.static || options.all) {
			await copystatic();
		}
	});
