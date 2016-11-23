import {
	sync as glob
} from 'glob';

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
export function render(v) {
	let version = v || require(LibPath("package.json")).version;
	let help = "";
	help += `  version: ${version}\n`;
	help += "  Command list:\n";
	help += hmany(require('../commands').default);

	let proycommands=[];
	for (const file of glob(ProyPath('commands', "*.js")).concat(glob(ProyPath('koaton_modules', '**', 'commands', "*.js")))) {
		const command = require(file);
		proycommands.push( command.default? command.default:command);
	}
	if (proycommands.length > 0) {
		help += "Project commands:\n";
		help += hmany(proycommands);
	}
	return help;
}
