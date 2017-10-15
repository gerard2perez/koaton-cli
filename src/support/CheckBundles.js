import spin from '../spinner';
import { livereload } from '../utils/livereload';
import mkdir from '../utils/mkdir';
import notifier from './Notifier';
import BundleItem from './BundleItem';
import { watch as Watch } from 'chokidar';
import { resolve } from 'path';
import hasfile from '../utils/hasfile';

let allBundles = {};
let hashes = {};
const spinner = spin();
function reloadFiles (bundle, files) {
	for (const file of files) {
		livereload.reload(`/${bundle.kind}/${file}`);
		// notifier('Koaton', `Reloading /${bundle.kind}/${file}`);
	}
}
async function onChange (bundle, file) {
	let filepath = resolve(file);
	let newhash = await hasfile(file);
	if (newhash !== hashes[filepath]) {
		reloadFiles(bundle, await bundle.build());
		hashes[filepath] = newhash;
	}
}
async function makehashes (files) {
	for (const file of files) {
		hashes[resolve(file)] = await hasfile(file);
	}
}
async function DetectChanges (changed) {
	const newconf = requireNoCache(ProyPath('config', 'bundles.js')).default;
	for (const bundle of Object.keys(newconf)) {
		let mustrebuild = false;
		if (allBundles[bundle]) {
			let current = allBundles[bundle].content;
			let incoming = newconf[bundle];
			let added = incoming.filter(o => { return current.indexOf(o) === -1; });
			let removed = current.filter(o => { return incoming.indexOf(o) === -1; });
			for (const add of added) {
				mustrebuild = true;
				// allBundles[bundle].add(add);
				hashes[resolve(add)] = await hasfile(add);
			}
			for (const remove of removed) {
				mustrebuild = true;
				// allBundles[bundle].remove(remove);
				delete hashes[resolve(remove)];
			}
			allBundles[bundle].clear();
			incoming.forEach(allBundles[bundle].add);
		} else {
			mustrebuild = true;
			allBundles[bundle] = new BundleItem(bundle, newconf[bundle], true);
			allBundles[bundle].watch(onChange.bind(null, allBundles[bundle]));
			scfg.bundles.add(bundle, []);
		}
		allBundles[bundle].isUpdating = true;
		if (mustrebuild) {
			reloadFiles(allBundles[bundle], await allBundles[bundle].build());
		}
	}
	for (const bundle in allBundles) {
		if (!allBundles[bundle].isUpdating) {
			allBundles[bundle].watcher.close();
			delete allBundles[bundle];
			scfg.bundles.remove(bundle);
		} else {
			allBundles[bundle].isUpdating = false;
		}
	}
}
function logger (msg) {
	spinner.update(msg.replace(/\n|\t/igm, ''));
}
const bWatcher = new Watch(ProyPath('config', 'bundles.js'), {
	persistent: true,
	ignoreInitial: true,
	alwaysStat: false,
	awaitWriteFinish: {
		stabilityThreshold: 300,
		pollInterval: 100
	}
});
bWatcher.on('change', DetectChanges);
async function checkbundles () {
	spinner.start(50, 'Building Bundles'.green, undefined, process.stdout.columns);
	await mkdir(ProyPath('public', 'css'), null);
	await mkdir(ProyPath('public', 'js'), null);
	for (const bundle of configuration.bundles) {
		let b = allBundles[bundle.file] = new BundleItem(bundle.file, bundle.content, true);
		await b.build(logger);
		b.watch(onChange.bind(null, b));
		makehashes(b.sources);
	}
	spinner.end(`   ${__ok.green} Bundles Built`);
	return true;
}

export default checkbundles;
