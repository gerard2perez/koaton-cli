import spin from '../spinner';
import * as fs from 'fs-extra';
import livereload from '../utils/livereload';
import mkdir from '../utils/mkdir';
import canAccess from '../utils/canAccess';
import notifier from './Notifier';
import BundleItem from './BundleItem';
import {buildCSS, buildJS} from '../commands/build';
import {watch as Watch} from 'chokidar';
import * as path from 'upath';
import { hasChanged, getDiferences } from './DetectChangesInArray';

const spinner = spin();
let BundleMappings = {}, production;
const DetectChanges = async function () {
		console.log(arguments);
			const newconf = requireNoCache(ProyPath('config', 'bundles.js')).default;
			for (const bundle of Object.keys(newconf)) {
				newconf[bundle] = new BundleItem(bundle, newconf[bundle]);
			}
			let branches = Object.keys(newconf).concat(Object.keys(configuration.bundles));
			branches = branches.filter((f, i) => branches.indexOf(f) === i);
			for (const branch of branches) {
				if (hasChanged(configuration.bundles[branch], newconf[branch])) {
					let _new = newconf[branch] ? newconf[branch].content : undefined;
					let _old = configuration.bundles[branch] ? configuration.bundles[branch].content : undefined;
					let differences = getDiferences(_old, _new);
					let reload = differences.added[0];
					if (differences.deleted) {
						const bundle = scfg.bundles[branch];
						for (const target of bundle) {
							let wtc = path.basename(target);
							BundleMappings[wtc].Watcher.close();
							delete BundleMappings[wtc];
						}
						console.log(`UnWatching ${branch}`);
					} else if (differences.isnew) {
						await getMapping(newconf[branch]);
						console.log(`Watching ${branch}`);
						console.log(differences.added);
					} else {
						BundleMappings[branch].Watcher.unWatch(differences.removed);
						BundleMappings[branch].Watcher.add(differences.added);
						console.log('touching', reload);
						fs.closeSync(fs.openSync(reload, 'a'));
					}
				}
			}
			configuration.bundles = newconf;
	},
	RebuildAndReload = async function (bundle, compiledFile, sources, build) {
		let target = await build(bundle.file, bundle, !production);
		let files = [];
		for (const file of scfg.bundles[bundle.file].content) {
			files.push(file);
			livereload.reload(file);
		}
		notifier('Koaton', `Reloading ${bundle.file} -> ${files.join(',')}`);
	},
	logger = function (msg) {
		spinner.update(msg.replace(/\n|\t/igm, ''));
	},
	getMapping = async function getMapping (bundle) {
		if (bundle.kind === '.css') {
			let buildresult;
			buildresult = await buildCSS(bundle.file, bundle, !production, production && !(canAccess(ProyPath('public', 'css', bundle))), logger);
			for (const b of Object.keys(buildresult)) {
				BundleMappings[b] = {
					Target: b,
					Source: buildresult[b],
					Bundle: bundle,
					Build: buildCSS,
					Watcher: new Watch(buildresult[b], {
						persistent: true,
						ignoreInitial: true,
						alwaysStat: false,
						awaitWriteFinish: {
							stabilityThreshold: 300,
							pollInterval: 100
						}
					})
				};
			}
		} else {
			BundleMappings[bundle.file] = {
				Target: bundle.file,
				Bundle: bundle,
				Source: bundle.content,
				Build: buildJS,
				Watcher: new Watch(await buildJS(bundle.file, bundle, !production, production && !canAccess(ProyPath('public', 'js', bundle)), logger), {
					persistent: true,
					ignoreInitial: true,
					alwaysStat: false,
					awaitWriteFinish: {
						stabilityThreshold: 300,
						pollInterval: 100
					}
				})
			};
		}
	};
async function checkbundles () {
	spinner.start(50, 'Building Bundles'.green, undefined, process.stdout.columns);
	await mkdir(ProyPath('public', 'css'), null);
	await mkdir(ProyPath('public', 'js'), null);
	production = scfg.env === 'production';
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
	for (const bundle of configuration.bundles) {
		await getMapping(bundle);
	}
	makeObjIterable(BundleMappings);
	if (!production) {
		for (const element of BundleMappings) {
			let rebuild = RebuildAndReload.bind(null, element.Bundle, element.Target, element.Sources, element.Build);
			element.Watcher.on('change', rebuild);
		}
	}
	spinner.end(`   ${__ok.green} Bundles Built`);
	return true;
}

export default checkbundles;
