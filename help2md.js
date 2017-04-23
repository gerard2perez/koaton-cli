const fs = require('fs-extra');
// const importindex = require('./lib/utils/importindex').default;
// console.log( fs.readdirSync('./lib/commands') );
// const commands = importindex('./lib/commands');
require('./lib/globals');
const configuration = require('cmd-line/lib/configuration');
global.print = (...args) => {
	console.log(...args);
};
let final = '## Koaton-CLI Commands\n';
const log = function (str = '') {
	final += str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') + '\n';
};
log('if you write `koaton` `koaton -h` in your terminal you will get this output.');
for (const lib of fs.readdirSync('./lib/commands')) {
	const command = lib.replace('.js', '');
	log(`* [${command}](#${command})`);
}
log();
for (const lib of fs.readdirSync('./lib/commands')) {
	const command = require(`./lib/commands/${lib}`).default;
	const args = command.args.length > 0 ? `**${command.args.join('** **')}**` : '';
	const opts = command.options.length > 0 ? '[options]' : '';
	log(`## koaton ${command.cmd} ${args} ${opts} <a name="${command.cmd}"/>`.replace(/ +/g, ' '));
	if (command.description) {
		log(`> ${command.description}`);
		log();
	}
	log('*[options]*:');
	log('```');
	for (const option of command.options) {
		log(configuration.optionSerializer(option));
	}
	log('```');
	log();
}

fs.writeFileSync('./commands.md', final);
