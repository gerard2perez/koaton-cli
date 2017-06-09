import { sync as glob } from 'glob';
import * as path from 'upath';
import copy from '../utils/copy';
import * as fs from 'fs-extra';
import 'colors';

let success = 0,
	failed = 0;

function done () {
	success++;
}

function fail () {
	failed++;
}

export default async function copystatic () {
	const config = requireNoCache(ProyPath('config', 'static'), {default: {}}).default.copy;
	let promises = [];
	for (const bundle of config) {
		let compiled = false;
		if (typeof bundle === 'object') {
			for (const pattern of bundle.src) {
				let originalnodes = pattern.split('/');
				for (const file of glob(pattern)) {
					let filename = file;
					filename = path.basename(file);
					if (bundle.flatten) {
						fs.ensureDirSync(ProyPath('public', bundle.dest));
					} else {
						let targetnodes = file.split('/');
						let filtered = originalnodes.filter(n => targetnodes.indexOf(n) > -1).join('/');
						filtered = path.dirname(file).replace(filtered, '');
						fs.ensureDirSync(ProyPath('public', bundle.dest, filtered));
						filename = path.join(filtered, filename);
					}
					compiled = true;
					// console.log(ProyPath('public', bundle.dest, filename));
					promises.push(copy(file, ProyPath('public', bundle.dest, filename)).then(done, fail).catch(fail));
				}
			}
		} else {
			for (const file of glob(bundle)) {
				compiled = true;
				fs.ensureDirSync(ProyPath('public', path.dirname(file)));
				promises.push(copy(file, ProyPath('public', file)).then(done, fail).catch(fail));
			}
		}
		if (!compiled) {
			console.log(`Pattern: ${bundle.src} produce no result`);
		}
	}
	// TODO: I just don't know why this get reset, but this is a temporal fix.
	const oripath = process.cwd();
	return Promise.all(promises).then(() => {
		process.chdir(oripath);
		console.log(`   ${__ok.green} Static Files [${success.toString().green} files copied. ${failed.toString().red} files failed.]`);
		// console.log(`    -> Static Files Copied ${__ok.green}`);
	});
}
