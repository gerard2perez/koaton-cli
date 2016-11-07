import * as path from 'path';

let mods = {};
readDir(__dirname)
	.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
	.filter(item => item !== "index.js")
	.filter(item => item !== "help.js")
	.forEach((file) => {
		if (file.indexOf("barebone") === -1) {
			let module = require(path.join(__dirname, file));
			mods[path.basename(file).replace(".js", "")] = module.default ? module.default : module;
		}
	});
makeObjIterable(mods);
export default mods;
