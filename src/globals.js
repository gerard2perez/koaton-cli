import * as os from 'os';
import * as rawpath from 'path';
import * as path from 'upath';
import { existsSync, readdirSync } from 'fs-extra';
import * as co from 'co';
import { sync as glob } from 'glob';

process.env.isproyect = existsSync('public') &&
existsSync('app.js') &&
existsSync('package.json') &&
existsSync('routes.js') &&
existsSync('config');

global.ProyPath = function (...args) {
	args.splice(0, 0, process.cwd());
	return path.normalize(path.join.apply(path, args));
};
if (process.env.isproyect === 'true') {
	require(ProyPath('node_modules', 'koaton/lib/support', 'globals'));
}
global.skipshell = false;
global.__ok = os.platform() === 'win32' ? '√' : '✓';
global.__nok = os.platform() === 'win32' ? 'X' : '✗';

const dir = __dirname.replace('src', '').replace('lib', '');
global.makeObjIterable = function makeObjIterable (obj) {
	obj[Symbol.iterator] = function () {
		let keys = Object.keys(this),
			index = -1;
		return {
			next: () => ({
				value: this[keys[++index]],
				done: !(index < keys.length)
			})
		};
	};
	return obj;
};
global.requireUnCached = function (lib) {
	delete require.cache[require.resolve(lib)];
	return requireSafe(lib);
};
global.cleanString = (text) => {
	return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
};
global.readDir = function (...args) {
	try {
		return readdirSync(path.join.apply(path, args));
	} catch (e) {
		return [];
	}
};
global.Events = (phase, event) => {
	let promises = [];
	for (const file of glob(`events/${phase}_${event}.js`).concat(glob(`koaton_modules/**/events/${phase}_${event}.js`))) {
		promises.push(co.wrap(require(path.resolve(file)).default)(ProyPath()));
	}
	return Promise.all(promises);
};
global.requireSafe = function requireSafe (lib, defaults) {
	try {
		return require(lib);
	} catch (e) {
		return defaults;
	}
};
global.requireNoCache = function requireNoCache (lib, defaults) {
	let library = rawpath.normalize(rawpath.resolve(lib));
	if (library.indexOf('.json') === -1) {
		library = library.replace('.js', '') + '.js';
	}
	delete require.cache[library];
	return requireSafe(library, defaults);
};
global.ProyPath = function (...args) {
	args.splice(0, 0, process.cwd());
	return path.normalize(path.join.apply(path, args));
};
global.CLIPath = function CLIPath (...args) {
	args.splice(0, 0, __dirname);
	return path.normalize(path.join.apply(path, args));
};
global.LibPath = function (...args) {
	args.splice(0, 0, dir);
	return path.normalize(path.join.apply(path, args));
};
global.TemplatePath = function (...args) {
	args.splice(0, 0, 'templates');
	// args.splice(0, 0, '..');
	args.splice(0, 0, dir);
	return path.normalize(path.join.apply(path, args));
};
if (process.env.isproyect === 'true') {
	const Server = require('./support/Server').default;
	global.scfg = new Server();
} else {
	global.scfg = {
		version: '0.0.0',
		database: {}
	};
}
