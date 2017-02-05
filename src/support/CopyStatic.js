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

export default function copystatic () {
	const config = requireNoCache(ProyPath('config', 'static'), {default: {}}).default.copy;
	let promises = [];
	for (const bundle of config) {
		let compiled = false;
		if (typeof bundle === 'object') {
			for (const pattern of bundle.src) {
				for (const file of glob(pattern)) {
					let filename = file;
					if (bundle.flatten) {
						filename = path.basename(file);
					}
					fs.ensureDirSync(ProyPath('public', bundle.dest));
					compiled = true;
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
	return Promise.all(promises).then(() => {
		console.log(`   ${__ok.green} Static Files [${success.toString().green} files copied. ${failed.toString().red} files failed.]`);
		// console.log(`    -> Static Files Copied ${__ok.green}`);
	});
}
