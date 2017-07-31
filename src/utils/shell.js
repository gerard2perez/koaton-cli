import * as path from 'upath';
import * as spawn from 'cross-spawn';
import spin from '../spinner';

const spinner = spin();

export default function shell (display, command, cwd = process.cwd()) {
	return new Promise(function (resolve) {
		let shelllog = '';
		if (skipshell) {
			console.log(`+ ${display}\t${__ok}`.green);
			resolve(0);
			return;
		}
		let buffer = '';
		let c = null;
		const output = function (data) {
			shelllog += data.toString();
			buffer += data.toString();
			if (buffer.indexOf('\n') > -1) {
				let send = buffer.toString().split('\n');
				spinner.pipe({
					action: 'extra',
					msg: send[0].substr(0, 150).replace(/\n/igm, '')
				});
				buffer = '';
			}
		};
		const child = spawn(command[0], command.slice(1), {
			cwd: path.join(cwd, '/'),
			shell: true
		});
		spinner.start(50, display, undefined, process.stdout.columns).then(() => {
			resolve(c);
		});
		child.stderr.on('data', output);
		child.stdout.on('data', output);
		/* istanbul ignore next */
		child.on('error', function () {
			c = 1;
			spinner.end(shelllog);
		});
		child.on('close', function (code) {
			c = code;
			spinner.end(`   ${code === 0 ? __ok.green : __nok.red} ${display}`);
		});
	});
}
