import * as os from 'os';
import * as rawpath from 'path';
import * as path from 'upath';
import * as fs from 'fs-extra';
import { canAccess } from './utils';
import * as co from 'co';

process.env.isproyect = canAccess('public') &&
canAccess('app.js') &&
canAccess('package.json') &&
canAccess('routes.js') &&
canAccess('config');

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
		return fs.readdirSync(path.join.apply(path, args));
	} catch (e) {
		return [];
	}
};
global.accessSync = function accessSync (dir) {
	try {
		fs.accessSync(dir);
		return true;
	} catch (e) {
		return false;
	}
};
const Events = function Events (path, event, phase, forcedir) {
	let Path = ProyPath(path);
	let m = requireNoCache(ProyPath(path, `${event}_${phase}`));
	switch (typeof m) {
		case 'undefined':
		case undefined:
		case 'string':
		case 'number':
		case 'object':
			return async function () {
				// do nothing.
			};
		case 'function':
			return async function eventfn () {
				/*eslint no-prototype-builtins:0*/
				try {
					if (m.prototype === undefined || m.prototype.hasOwnProperty('constructor')) {
						m(forcedir || Path);
					} else {
						await m(forcedir || Path);
					}
				} catch (e) {
					console.log(e.stack);
				}
			};

		default:
			return m.bind(null, Path);
	}
};
global.Events = co.wrap(Events);
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
