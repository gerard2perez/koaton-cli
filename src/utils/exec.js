import { exec as exe } from 'child_process';

export default function exec (cmd, cfg) {
	return new Promise((resolve) => {
		exe(cmd, cfg, (err, stdout, stderr) => {
			return err ? resolve(err) : resolve({
				stdout: stdout,
				stderr: stderr
			});
		});
	});
}
