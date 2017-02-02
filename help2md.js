const fs = require('fs-extra');
require('./lib/globals');
const commands = require('./lib/commands').default;

let final = '## Koaton-CLI Commands\n';
const log = function (str = '') {
	final += str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') + '\n';
};
log('if you write `koaton` `koaton -h` in your terminal you will get this output.');
for (const command of commands) {
	log(`* [${command.cmd}](#${command.cmd})`);
}
log();
for (const command of commands) {
	const args = command.args.length > 0 ? `<${command.args.join('> <')}>` : '';
	const opts = command.options.length > 0 ? '[options]' : '';
	log(`## koaton ${command.cmd} ${args} ${opts} <a name="${command.cmd}"/>`.replace(/ +/g, ' '));
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
}

fs.writeFileSync('./commands.md', final);
