import * as path from 'path';
import * as fs from 'fs';

export default function loadmodules(dir) {
	process.stdout.write(dir + '\n')
	let mods = {};
	fs.readdirSync(dir)
		.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
		.filter(item => item !== "index.js")
		.filter(item => item !== "help.js")
		.forEach((file) => {
			let name = path.basename(file).replace(".js", "");
			let module = require(path.join(dir, name));
			mods[name] = module.default ? module.default : (module[name] ? module[name]:module);
		});
	mods[Symbol.iterator] = function() {
		let keys = Object.keys(this),
			index = -1;
		return {
			next: () => ({
				value: this[keys[++index]],
				done: !(index < keys.length)
			})
		};
	};
	mods.default = mods;
	return mods;
}
