import { watch as Watch } from 'chokidar';
import notifier from './support/Notifier';
import livereload from './utils/livereload';
import * as spawn from 'cross-spawn';
import * as psTree from 'ps-tree';

function LoadServer (resolve, reject, EmberPids, nginx) {
	console.log(nginx);
	let PIDPromises = [];
	if (process.env.istesting) {
		for (const pid of EmberPids) {
			PIDPromises.push(new Promise((resolve) => {
				psTree(pid, (err, children) => {
					if (err) {
						reject(err);
					}
					let childIPIDs = children.map((p) => parseInt(p.PID, 10));
					resolve(childIPIDs);
				});
			}));
		}
	}
	let KoatonServer = spawn('node', ['app.js'], { shell: false });
	KoatonServer.stdout.on('data', (buffer) => {
		process.stdout.write(buffer);
		let text = buffer.toString();
		let found = text.indexOf('Enviroment') > -1;
		if (found) {
			notifier('Koaton', `Serving http://${scfg.hostname}${nginx ? '' : ':' + scfg.port}`);
			livereload.reload();
			if (process.env.istesting) {
				Promise.all(PIDPromises).then((PIDs) => {
					let pids = [];
					for (const pidg of PIDs) {
						pids = pids.concat(pidg);
					}
					psTree(KoatonServer.pid, (err, children) => {
						if (err) {
							reject(err);
						}
						let childIPIDs = children.map((p) => parseInt(p.PID, 10));
						resolve(pids.concat(childIPIDs));
					});
				});
			}
		}
	});
	KoatonServer.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`);
	});

	KoatonServer.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
	});
	return KoatonServer;
}

export default function StartKoatonServer (resolve, reject, EmberPids, nginx = false) {
	let watcher = new Watch('./**', {
		awaitWriteFinish: {
			stabilityThreshold: 500,
			pollInterval: 50
		},
		ignoreInitial: true,
		ignored: [
			'.git',
			'node_modules',
			'koaton_module_package',
			'ember',
			'assets',
			'public',
			'commands',
			'koaton_modules',
			'views',
			'downloads',
			'config/bundles.js',
			'*.tmp',
			'*.json',
			'*.conf'
		]
	});
	let server = LoadServer(resolve, reject, EmberPids, nginx);
	watcher.on('all', (event, path) => {
		server.kill();
		server = LoadServer(resolve, reject, EmberPids, nginx);
	});
	return server;
}
