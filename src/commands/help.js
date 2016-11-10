import * as path from 'path';
import utils from '../utils';

export function hmany(commands) {
	let help = "";
	for (let name in commands) {
		help += hsingle(commands[name]);
	}
	return help;
}
export function hsingle(definition) {
	let help = "";
	var args = definition.args.length > 0 ? `<${definition.args.join("> <")}>` : "";
	var opts = definition.options.length > 0 ? "[options]" : "";
	help += `    koaton ${definition.cmd} ${args.yellow} ${opts.cyan}\n`;
	help += `      ${definition.description.replace('\n',"\n   ")}\n`;
	definition.options.forEach(function(option) {
		var opt = option[1].split(' ');
		opt[0] = option[0] === opt[0] ? "" : opt[0];
		opt[1] = opt[1] || "";
		while (opt[0].length < 13) {
			opt[0] = opt[0] + " "
		}
		help += `      ${option[0].cyan} ${opt[0].gray} ${opt[1].cyan} ${option[2]}\n`;
	});
	return help + "\n\n";
}
export function include() {
	let mods = {};
	if (utils.canAccess(ProyPath("commands"))) {
		readDir(ProyPath("commands"))
			.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
			.filter(item => item !== "index.js")
			.filter(item => item !== "help.js")
			.forEach((file) => {
				let module = require(ProyPath("commands", file));
				mods[path.basename(file).replace(".js","")] = module.default ? module.default:module;
			});
		makeObjIterable(mods);
	}
	return mods;
}
export function render(v){
	let version = v || require(LibPath("package.json")).version;
	let help = "";
	help += `  version: ${version}\n`;
	help += "  Command list:\n";
	help += hmany(require('./index').default);

	const proycommands = include();
	console.log(proycommands);
	if (Object.keys(proycommands).length > 0) {
		help += "Project commands:\n";
		help += hmany(proycommands);
	}
	return help;
}
