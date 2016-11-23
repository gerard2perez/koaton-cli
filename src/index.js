/*eslint no-process-exit: 0*/
import 'colors';
import * as co from 'co';
import * as program from 'commander';
import './globals';
import commands from './commands';
import {render as renderH} from './support/help';
import include from './utils/.include_base';

process.env.NODE_ENV = process.argv.indexOf("-p") > -1 || process.argv.indexOf("--production") > -1 ? "production" : "development";
process.env.port = parseInt(process.argv[process.argv.indexOf("--port") + 1], 10) || 62626;
const help = process.argv.slice(2)[0];

const pcmds = include(ProyPath('commands'));
if (!help || help === "-h" || help === "--help") {
	console.log(renderH());
	process.exit(0);
}
const Action = async function Action(definition, command, ...args) {
	try {
		if (!(definition.cmd === "new" || definition.cmd === "semver") && process.env.isproyect === 'false') {
			if (process.argv[3] !== '-h' && process.argv[3] !== '--help') {
				throw definition.cmd;
			}
		}
	} catch (e) {
		console.log();
		console.log("You must be inside a koaton proyect to run this command.")
		console.log();
		process.exit(1);
	}

	var exitCode = 1;
	try {
		console.log(`koaton-cli version ${scfg.version}\n`);
		exitCode = await definition.action.apply(command, args);
	} catch (err) {
		console.log(err.stack);
		process.exit(1);
	}
	process.exit((exitCode === 0 || exitCode === undefined) ? 0 : 1);
};
for (const definition of Object.assign(commands, pcmds)) {
	try {
		const arg = definition.args.length > 0 ? `[${definition.args.join("] [")}]` : "";
		const command = program.command(`${definition.cmd} ${arg}`)
			.description(definition.description);

		const ACT = Action.bind(null, definition, command);
		command.action(co.wrap(ACT));
		if (definition.alias) {
			command.alias(definition.alias);
		}
		definition.options.forEach(function(option) {
			command.option(`${option[0]}, ${option[1]}`, option[2]);
		});
	} catch (e) {
		console.log(e.stack);
	}
	//});
}
program.parse(process.argv);
process.on("beforeExit", () => {
	console.log();
	console.log("That command does not exists.".cyan);
	console.log();
	process.exit(1);
});
process.title = "Koaton";
