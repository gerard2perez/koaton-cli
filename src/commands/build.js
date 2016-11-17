import * as path from 'upath';
import * as crypto from "crypto";
import * as fs from "graceful-fs";
import * as uglify from "uglify-js";
import * as Concat from 'concat-with-sourcemaps';
import {
	sync as readSync
} from 'glob';

import {
	promisify as Promise
} from 'bluebird';
import utils from '../utils';
import command from '../command';
import BundleItem from '../support/BundleItem';
import spin from '../spinner';


const spinner = spin();
const copystatic = async function copystatic() {
	const copy = requireSafe(ProyPath("config", "copy"), {});
	for (const dir in copy) {
		await utils.mkdir(ProyPath("public", dir), -1);
		for (const idx in copy[dir]) {
			let directories = readSync(ProyPath(copy[dir][idx]));
			for (const i in directories) {
				const file = directories[i];
				await utils.copy(file, ProyPath("public", dir, path.basename(file)));
			}
		}
	}
}
const hasFileName = function(file, content) {
	const basename = path.trimExt(file);
	const ext = file.replace(basename, "");
	const hasher = crypto.createHash('sha1');
	hasher.update(content);
	const hash = hasher.digest('hex').slice(0, 20);
	return basename + "_" + hash + ext;
}
const compressImages = function(files, dest) {
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
}
const buildCSS = async function buildCSS(target, source, development, onlypaths, logger) {
	if (scfg.bundles.has(target)) {
		scfg.bundles[target].clear();
	} else {
		scfg.bundles.add(new BundleItem(target, []));
	}
	const ITEM = scfg.bundles[target];

	utils.writeuseslog = logger;
	const less = require('less'),
		sass = Promise(require('node-sass').render),
		CssImporter = require('node-sass-css-importer')(),
		LessPluginCleanCSS = require('less-plugin-clean-css');

	const concat = new Concat(true, path.join("css", target + ".map"), '\n'),
		cleanCSSPlugin = new LessPluginCleanCSS({
			advanced: true
		}),
		watchinFiles = [];

	for (let index in source) {
		if (!development) {
			utils.rmdir(path.join("public", "css", index + target));
		}
		let file = path.normalize(source[index]),
			basename = path.basename(file);
		if (file.indexOf(".less") > -1) {
			let content = await less.render(fs.readFileSync(file, 'utf-8'), {
				plugins: [cleanCSSPlugin],
				filename: file,
				compres: true,
				sourceMap: onlypaths ? {} : {
					outputSourceFiles: true,
					sourceMapBasepath: path.normalize(file.replace(basename, "")),
					sourceMapFileInline: development,
					sourceMapRootpath: "/" + basename
				}
			});
			if (development) {
				watchinFiles[index + target] = content.imports;
				watchinFiles[index + target].push(file);
				if (!onlypaths) {
					utils.write(path.join("public", "css", index + target), content.css.toString(), 'utf-8', true);
				}
				console.log();
				ITEM.add(`/css/${index+target}`);
			} else {
				concat.add(basename, content.css, concat.map);
			}
		} else if (file.indexOf(".scss") > -1 || file.indexOf(".sass") > -1) {
			let content = await sass({
				sourceMap: onlypaths ? false : "/",
				sourceMapRoot: onlypaths ? undefined : "/" + target + "/",
				sourceMapContents: onlypaths ? undefined : true,
				sourceMapEmbed: onlypaths ? undefined : development,
				outputStyle: "compressed",
				file: file,
				importer: [CssImporter]
			});
			if (development) {
				watchinFiles[index + target] = content.stats.includedFiles;
				if (!onlypaths) {
					utils.write(path.join("public", "css", index + target), content.css.toString(), 'utf-8', true);
				}
				ITEM.add(`/css/${index+target}`);
			} else {
				concat.add(basename, content.css, concat.map);
			}
		} else if (file.indexOf(".css")) {
			watchinFiles[index + target] = readSync(file);
			const concatCSS = new Concat(true, path.join("css", index + target + ".css"), '\n');
			if (!development || !onlypaths) {
				for (const url in watchinFiles[index + target]) {
					concatCSS.add(target, fs.readFileSync(watchinFiles[index + target][url]));
				}
			}
			if (development && !onlypaths) {
				utils.write(ProyPath("public", "css", index + target), concatCSS.content, 'utf-8', true);
				ITEM.add(`/css/${index+target}`);
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
				path.join("public", "css", file),
				concat.content.toString(), 'utf-8', true);

			ITEM.clear().add(`/css/${file}`);
		}
	}
	utils.writeuseslog = undefined;
	return watchinFiles;
}
const buildJS = async function buildJS(target, source, development, onlypaths, logger) {
	const ITEM = scfg.bundles[target] || new BundleItem(target, []);
	ITEM.clear();
	utils.writeuseslog = logger;
	let AllFiles = [];
	for (var index in source) {
		AllFiles = AllFiles.concat(readSync(path.join(process.cwd(), path.normalize(source[index]))));
	}
	if (onlypaths) {
		return AllFiles;
	}
	let result = uglify.minify(AllFiles, {
		mangle: false,
		outSourceMap: onlypaths ? false : " /js/" + target + ".map",
		sourceMapIncludeSources: onlypaths ? false : development,
		sourceRoot: "/" + target,
		compress: {
			dead_code: true,
			sequences: true,
			unused: true
		}
	});
	if (!onlypaths) {
		const file = development ? target : hasFileName(target, result.code.toString());
		utils.write(path.join("public", "js", file), result.code, {
			encoding: 'utf-8'
		}, true);
		if (development) {
			fs.writeFileSync(path.join("public", "js", target + ".map"), result.map, 'utf8');
		}

		ITEM.add("/js/" + file);
	}
	utils.writeuseslog = undefined;
	scfg.bundles.remove(ITEM).add(ITEM);
	return AllFiles;
}
const getInflections = async function getInflections(app_name) {
	const inflections = require(path.join(process.cwd(), "config", "inflections.js")),
		irregular = (inflections.plural || [])
		.concat(inflections.singular || [])
		.concat(inflections.irregular || []),
		uncontable = (inflections.uncountable || []).map((inflection) => {
			return `/${inflection}/`
		});
	utils.render(TemplatePath("ember_apps", "inflector.js"), ProyPath("ember", app_name, "app", "initializers", "inflector.js"), {
		irregular: JSON.stringify(irregular),
		uncontable: JSON.stringify(uncontable)
	})
}
const preBuildEmber = async function preBuildEmber(application, options) {
	const ember_proyect_path = ProyPath("ember", application);
	options.mount = path.join('/', options.mount || "", "/");
	options.mount = options.mount.replace(/\\/igm, "/");
	await utils.mkdir(ProyPath("ember", application, "app", "adapters"), -1);
	await getInflections(application, null);
	let adapter = require(ProyPath("config", "ember"))[application].adapter;
	if (adapter.indexOf("http://") !== 0) {
		adapter = "http://" + adapter;
	}
	let raw = fs.readFileSync(ProyPath("ember", application, "app", "adapters", "application.js"), 'utf-8');
	var exp = (/host: (.*),?/i).exec(raw);
	if (raw.indexOf("K:custom-adapter") === -1) {
		fs.writeFileSync(ProyPath("ember", application, "app", "adapters", "application.js"), raw.replace(exp[1], `'${adapter}'`));
	}
	let embercfg = await utils.read(path.join(ember_proyect_path, "config", "environment.js"), {
		encoding: 'utf-8'
	});
	embercfg = embercfg.replace(/baseURL: ?'.*',/, `baseURL: '${options.mount}',`);
	embercfg = embercfg.replace(/rootURL: ?'.*',/, `rootURL: '${options.mount}',`);
	return utils.write(path.join(ember_proyect_path, "config", "environment.js"), embercfg, 0);
}
const buildEmber = async function buildEmber(application, options) {
	await utils.mkdir(path.join(process.cwd(), "public", options.mount));
	let res = (await utils.shell(
		`Building ... ${application.yellow}->${options.mount.green}`, [
			"ember",
			"build",
			"--environment",
			options.build,
			"-o", path.join("..", "..", "public", options.mount)
		],
		ProyPath("ember", application)
	));
	return !res;
}
const postBuildEmber = async function postBuildEmber(application, options) {
	const emberinternalname = require(ProyPath("ember", application, "package.json" /*path.join(process.cwd(), "ember", application,"package.json"*/ )).name;
	//if (scfg.isDev) {
	let text = await utils.read(ProyPath("public", options.directory, "index.html"), {
			encoding: 'utf-8'
		}),
		indextemplate = await utils.read(TemplatePath("ember_apps", "index.handlebars"), 'utf-8'),
		meta = new RegExp(`<meta ?name="${emberinternalname}.*" ?content=".*" ?/>`);

	const links = new RegExp(`<link rel="stylesheet" href=".*?assets/.*.css.*>`, "gm");
	const scripts = new RegExp(`<script src=".*?assets/.*.js.*></script>`, "gm");
	const transformlinks=function transformlinks(text,expresion){
		return text.match(expresion).join("\n").replace(/href=".*?assets/igm, `href="/${application}/assets`).replace(new RegExp(application + "/", "gm"), options.directory + "/")
	};
	text = utils.compile(indextemplate, {
		title: options.title || application,
		layout: options.layout || "main",
		path: options.directory,
		mount: options.mount,
		app_name: application,
		meta: text.match(meta)[0],
		cssfiles:transformlinks(text, links),
		jsfiles: transformlinks(text, scripts)
	});
	await utils.mkdir(ProyPath("views", "ember_apps"), -1);
	return utils.write(ProyPath("views", "ember_apps", `${options.directory}.handlebars`), text, 1);
	//}
}
export {
	copystatic,
	getInflections,
	compressImages,
	postBuildEmber,
	preBuildEmber,
	buildEmber,
	buildCSS,
	buildJS
}
export default (new command(
	__filename,
	"Make bundles of your .js .scss .css files and output to public folder.\n   Default value is ./config/bundles.js"))
.Args("config_file")
	.Options([
		["-p", "--prod", "builds for production"]
	])
	.Action(async function(config_file, options) {
		options.prod = options.prod ? "production" : "development";
		process.env.NODE_ENV = options.prod;
		const source_file = process.cwd() + (config_file || '/config/bundles.js');
		const patterns = require(source_file);
		await utils.copy(path.join('assets', 'favicon.ico'), path.join('public', 'favicon.ico'), {
			encoding: "binary"
		});
		if (Object.keys(patterns).length === 0) {
			console.log("Nothing to compile on: " + source_file);
		} else {
			await utils.mkdir(ProyPath("public", "js"), -1)
			await utils.mkdir(ProyPath("public", "css"), -1)
			for (let bundle of scfg.bundles) {
				for (let compiledfile of bundle) {
					utils.rmdir(path.join("public", path.normalize(compiledfile)));
				}
			}
			console.log(`Updating bundles (env: ${options.prod})`);
			for (const key in patterns) {
				if (key.indexOf(".css") > -1) {
					await buildCSS(key, patterns[key], options.prod === "development");
				} else if (key.indexOf(".js") > -1) {
					await buildJS(key, patterns[key], options.prod === "development");
				}
			}
			const embercfg = require(`${process.cwd()}/config/ember`);
			for (const ember_app in embercfg) {
				let configuration = {
					directory: embercfg[ember_app].directory,
					mount: embercfg[ember_app].mount,
					build: "development",
					layout: embercfg[ember_app].layout
				};
				await preBuildEmber(ember_app, configuration);
				await buildEmber(ember_app, {
					mount: embercfg[ember_app].directory,
					build: options.prod,
					directory: embercfg[ember_app].directory
				});
				await postBuildEmber(ember_app, configuration);
			}
			spinner.start(50, "Compressing Images", undefined, process.stdout.columns);
			await compressImages([path.join('assets', 'img', '*.{jpg,png}')], path.join('public', 'img'));
			spinner.end("Images Compressed".green);
		}
	});
