const fs = require('fs-extra');
require('./lib/globals')
const commands = require('./lib/commands').default;

let final = "## Koaton-CLI Commands\n";
const log = function(str = "") {
final += str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "") + '\n';
}
log('if you write `koaton` `koaton -h` in your terminal you will get this output.');
for (const command of commands) {
	log(`* [${command.cmd}](#${command.cmd})`)
}
log();
for (const command of commands) {
	const args = command.args.length > 0 ? `<${command.args.join("> <")}>` : "";
	const opts = command.options.length > 0 ? "[options]" : "";
	log(`## koaton ${command.cmd} ${args} ${opts} <a name="${command.cmd}"/>`.replace(/ +/g, " "));
	if (command.description) {
		log(`> ${command.description}`);
		log();
	}
	log('*[options]*:');
	log('```');
	for (const option of command.options) {
		log(option.join('\t'));
	}
	log('```');
	log();
	// command.options.forEach(function(option) {
	// 	var opt = option[1].split(' ');
	// 	opt[0] = option[0] === opt[0] ? "" : opt[0];
	// 	opt[1] = opt[1] || "";
	// 	while (opt[0].length < 13) {
	// 		opt[0] = opt[0] + " "
	// 	}
	// 	help += `      ${option[0].cyan} ${opt[0].gray} ${opt[1].cyan} ${option[2]}\n`;
	// });
}

fs.writeFileSync('./commands.md', final);


/*
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
*/
