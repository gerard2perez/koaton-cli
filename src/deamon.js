import { watch as Watch } from 'chokidar';
import notifier from './support/Notifier';
import livereload from './utils/livereload';
import * as spawn from 'cross-spawn';

let KoatonServer;
function StartServer () {
	return spawn('node', ['app.js'], {
		shell: true,
		stdio: 'inherit'
	});
}
function LoadServer (resolve) {
	KoatonServer = spawn('node', ['app.js'], {
		shell: true
	});
	KoatonServer.stdout.on('data', (buffer) => {
		process.stdout.write(buffer);
		let text = buffer.toString();
		let found = text.indexOf('Enviroment') > -1;
		console.log(found);
		if (found) {
			notifier('Koaton', `Serving http://${scfg.hostname}:${scfg.port}`);
			livereload.reload();
			if (resolve) {
				resolve(0);
			}
		}
	});
}

export default function StartKoatonServer (resolve) {
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
			'models',
			'views',
			'config/bundles.js',
			'*.tmp',
			'*.json',
			'*.conf'
		]
	});
	if (resolve) {
		LoadServer(resolve);
	} else {
		return StartServer();
	}
	// const KoatonServer = require(ProyPath('app.js')).default;
	// // KoatonServer.once('listening', () => {
	// // 	notifier('Koaton', `Serving http://${scfg.hostname}:${scfg.port}`);
	// // 	livereload.reload();
	// // });
	// watcher.on('all', (event, path) => {
	// 	KoatonServer.listen(scfg.port, () => {
	// 		livereload.reload();
	// 		notifier('Koaton', 'restarting server...', 'Basso');
	// 	});
	// });
}
