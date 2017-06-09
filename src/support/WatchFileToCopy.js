import {watch as Watch} from 'chokidar';
import * as co from 'co';

const DetectChanges = function () {
	console.log(arguments);
	co(async function () {
		await require('./CopyStatic').default();
	});
};

export default function WatchStatic () {
	let production = scfg.env === 'production';
	if (production) {
		return;
	}
	let watcher = new Watch(ProyPath('config', 'static.js'), {
		persistent: true,
		ignoreInitial: true,
		alwaysStat: false,
		awaitWriteFinish: {
			stabilityThreshold: 300,
			pollInterval: 100
		}
	});
	watcher.on('change', DetectChanges);
}
