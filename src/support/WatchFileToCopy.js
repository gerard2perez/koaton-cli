import {watch as Watch} from 'chokidar';
import { hasChanged, getDiferences } from './DetectChangesInArray';

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
	watcher.on('change', (a, b) => {
		console.log(a, b);
	})
}
