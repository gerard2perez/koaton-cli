import * as path from 'path';
import { sync as glob } from 'glob';

export default function loadmodules (dir) {
	let mods = {};
	for (const file of glob(path.join(dir, '!(index|importindex).js'))) {
		try {
			let name = path.basename(file).replace('.js', '');
			let module = require(path.join(dir, name));
			mods[name] = module.default ? module.default : module;
		} catch (ex) {
			/* istanbul ignore next */
			console.log(ex);
			/* istanbul ignore next */
			process.exit(1);
		}
	}
	makeObjIterable(mods);
	Object.defineProperty(mods, 'default', {
		enumerable: false,
		value: mods
	});
	return mods;
}
