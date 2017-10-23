/* eslint no-div-regex: 0 */
import * as path from 'upath';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as uglify from 'uglify-js';
import * as Concat from 'concat-with-sourcemaps';
import { sync as glob } from 'glob';
import copystatic from '../support/CopyStatic';
import utils from '../utils';
import Command from 'cmd-line/lib/Command';
import BundleItem from '../support/BundleItem';
// import spin from '../spinner';
import { buildNginx } from '../functions/nginx';
import { buildAllImages } from '../functions/imagecompressor';
import EmberBuilder from '../support/EmberBuilder';

// const spinner = spin();
const hasFileName = function (file, content) {
	const basename = path.trimExt(file);
	const ext = file.replace(basename, '');
	const hasher = crypto.createHash('sha1');
	hasher.update(content);
	const hash = hasher.digest('hex').slice(0, 20);
	return basename + '_' + hash + ext;
};

async function buildCSS (target, bundle, development, onlypaths, logger) {
	let error = [];
	process.stdout.write(`Building ${target} `);
	let start = process.hrtime();
	const ITEM = scfg.bundles[target] || new BundleItem(target, []);
	ITEM.clear();
	utils.writeuseslog = logger;
	const less = require('less'),
		sass = function (options) {
			return new Promise(function (resolve, reject) {
				require('node-sass').render(options, function (err, result) {
					if (err) reject(err);
					resolve(result);
				});
			});
		},
		CssImporter = require('node-sass-css-importer')(),
		LessPluginCleanCSS = require('less-plugin-clean-css');
	const concat = new Concat(true, path.join('css', target + '.map'), '\n'),
		cleanCSSPlugin = new LessPluginCleanCSS({
			advanced: true
		}),
		watchinFiles = {};
	let urlocurrencies = [];
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
			urlocurrencies = urlocurrencies.concat(content.css.toString().match(/url\(.*\)[ |;]/igm));
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
			urlocurrencies = urlocurrencies.concat(content.css.toString().match(/url\(.*\)[ |;]/igm));
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
			urlocurrencies = urlocurrencies.concat(concatCSS.content.toString().match(/url\(.*\)[ |;]/igm));
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
			scfg.bundles.remove(ITEM).add(ITEM);
		}
	}
	utils.writeuseslog = undefined;
	let [seconds, nanoseconds] = process.hrtime(start);
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	console.log(`   ${__ok.green} ${target} ${(seconds * 1000) + Math.ceil(nanoseconds / 1e6)} ms`);
	if (error.length > 0) {
		console.log(error.join('\n'));
	}
	return watchinFiles;
}
async function buildJS (target, bundle, development, onlypaths, logger) {
	let error = [];
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
	let readfiles = {};
	for (const file of AllFiles) {
		readfiles[path.basename(file)] = fs.readFileSync(file, 'utf-8');
	}
	let map = target.replace('.js', '.map');
	let result = uglify.minify(readfiles, {
		mangle: false,
		sourceMap: onlypaths ? false : {
			root: '/src/',
			includeSources: onlypaths ? false : development,
			// filename: target,
			url: path.join('/js', map)
		},
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
			fs.writeFileSync(path.join('public', 'js', map), result.map, 'utf8');
		}

		ITEM.add('/js/' + file);
	}
	utils.writeuseslog = undefined;
	scfg.bundles.remove(ITEM).add(ITEM);
	let [seconds, nanoseconds] = process.hrtime(start);
	process.stdout.clearLine();
	process.stdout.cursorTo(0);
	console.log(`   ${__ok.green} ${target}  ${(seconds * 1000) + Math.ceil(nanoseconds / 1e6)} ms`);
	if (error.length > 0) {
		console.log(error.join('\n'));
	}
	return {[target]: AllFiles};
};

export { buildCSS, buildJS };
async function buildApps () {
	if (Object.keys(configuration.ember).length === 0) return 0;
	await Events('pre', 'ember_build');
	for (const appname in configuration.ember) {
		let EmberAPP = new EmberBuilder(appname, scfg.env, configuration.ember[appname]);
		await EmberAPP.build();
		// let cfg = {
		// 	directory: configuration.ember[emberAPP].directory,
		// 	mount: configuration.ember[emberAPP].mount,
		// 	build: scfg.env,
		// 	layout: configuration.ember[emberAPP].layout,
		// 	show: false
		// };
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
		console.log(`   Updating bundles (env: ${scfg.env})`);
		for (const key in configuration.bundles) {
			if (key.indexOf('.css') > -1) {
				await buildCSS(key, configuration.bundles[key], scfg.env === 'development');
			} else if (key.indexOf('.js') > -1) {
				await buildJS(key, configuration.bundles[key], scfg.env === 'development');
			}
		}
	}
}
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
			await buildAllImages();
		}
		if (options.static || options.all) {
			await copystatic();
		}
	});
