import {
	exec
} from 'child_process';

export default function exec_async(cmd, cfg) {
	return new Promise((resolve) => {
		try {
			exec(cmd, cfg, (err, stdout, stderr) => {
				return err ? resolve(err) : resolve({
					stdout: stdout,
					stderr: stderr
				})
			});
		} catch (e) {
			console.log(e);
			resolve(e);
		}
	});
}
