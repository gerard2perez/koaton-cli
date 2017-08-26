import {watch as Watch} from 'chokidar';

const DetectChanges = async function () {
	await require('./CopyStatic').default();
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
