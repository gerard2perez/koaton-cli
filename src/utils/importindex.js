import * as path from 'path';
import * as fs from 'fs';
import { sync as glob } from 'glob';

export default function loadmodules (dir) {
	let mods = {};
	for (const file of glob(path.join(dir, '!(index|importindex).js'))) {
		try {
			let name = path.basename(file).replace('.js', '');
			let module = require(path.join(dir, name));
			mods[name] = module.default ? module.default : module;
		} catch (ex) {
			console.log(ex);
			process.exit(1);
		}
	}
	mods[Symbol.iterator] = function () {
		let keys = Object.keys(this),
			index = -1;
		return {
			next: () => ({
				value: this[keys[++index]],
				done: !(index < keys.length)
			})
		};
	};
	Object.defineProperty(mods, 'default', {
		enumerable: false,
		value: mods
	});
	return mods;
}
