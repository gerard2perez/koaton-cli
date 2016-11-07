import * as path from 'path';

let mods = {};

readDir(__dirname)
	.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
	.filter(item => item !== "index.js")
	.filter(item => item !== "help.js")
	.forEach((file) => {
		let module = require(path.join(__dirname, file));
		mods[path.basename(file).replace(".js","")] = module.default ? module.default:module
	});
	mods[Symbol.iterator]=function(){
		let keys = Object.keys(this), index=-1;
		return {
			next: () => ({
				value: this[keys[++index]],
				done: !(index<keys.length)
			})
		};
	};
export default mods;
