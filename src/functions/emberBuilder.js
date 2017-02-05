import {write, read, mkdir, shell, compile, render} from '../utils';
import {sync as glob} from 'glob';
import * as co from 'co';
import * as fs from 'fs';
import {join} from 'path';

const getinflections = async function getInflections (appName, show = true) {
	const inflections = require(join(process.cwd(), 'config', 'inflections.js')),
		irregular = (inflections.plural || [])
		.concat(inflections.singular || [])
		.concat(inflections.irregular || []),
		uncontable = (inflections.uncountable || []).map((inflection) => {
			return `/${inflection}/`;
		});
	render(TemplatePath('ember_apps', 'inflector.js'), ProyPath('ember', appName, 'app', 'initializers', 'inflector.js'), {
		irregular: JSON.stringify(irregular),
		uncontable: JSON.stringify(uncontable)
	}, show ? 1 : null);
};
const getInflections = co.wrap(getinflections);
const prebuildember = async function preBuildEmber (application, options) {
	const emberProyectPath = ProyPath('ember', application);
	options.mount = join('/', options.mount || '', '/');
	options.mount = options.mount.replace(/\\/igm, '/');
	await mkdir(ProyPath('ember', application, 'app', 'adapters'), -1);
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
	let embercfg = await read(join(emberProyectPath, 'config', 'environment.js'), {
		encoding: 'utf-8'
	});
	embercfg = embercfg.replace(/baseURL: ?'.*',/, `baseURL: '${options.mount}',`);
	embercfg = embercfg.replace(/rootURL: ?'.*',/, `rootURL: '${options.mount}',`);
	return write(join(emberProyectPath, 'config', 'environment.js'), embercfg, 0);
};
const buildember = async function buildEmber (application, options) {
	await mkdir(join(process.cwd(), 'public', options.directory), -1);
	let env = process.env.NODE_ENV;
	let res = (await shell(
		`Building ${application.yellow} -> ${scfg.hostname}:${scfg.port}${options.mount.green}`, [
			'ember',
			'build',
			'--environment',
			options.build,
			'-o', join('..', '..', 'public', options.directory)
		],
		ProyPath('ember', application)
	));
	process.env.NODE_ENV = env;
	return !res;
};
const postbuildember = async function postBuildEmber (application, options) {
	const emberinternalname = require(ProyPath('ember', application, 'package.json')).name;
	let text = await read(ProyPath('public', options.directory, 'index.html'), {
			encoding: 'utf-8'
		}),
		indextemplate = await read(TemplatePath('ember_apps', 'index.handlebars'), 'utf-8'),
		meta = new RegExp(`<meta ?name="${emberinternalname}.*" ?content=".*" ?/>`);

	const links = new RegExp('<link rel="stylesheet" href=".*?assets/.*.css.*>', 'gm');
	const scripts = new RegExp('<script src=".*?assets/.*.js.*></script>', 'gm');
	const transformlinks = function transformlinks (text, expresion) {
		return text.match(expresion).join('\n')
					.replace(/="[^=]*?assets/igm, `="/${options.directory}/assets`);
	};
	text = compile(indextemplate, {
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
	await mkdir(ProyPath('views', 'ember_apps'), null);
	return write(ProyPath('views', 'ember_apps', `${options.directory}.handlebars`), text);
};

const preBuildEmber = co.wrap(prebuildember);
const buildEmber = co.wrap(buildember);
const postBuildEmber = co.wrap(postbuildember);

export {
	postBuildEmber,
	preBuildEmber,
	buildEmber
};
