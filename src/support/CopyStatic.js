import { sync as glob } from 'glob';
import * as path from 'upath';
import copy from '../utils/copy';
import * as fs from 'fs-extra';

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
					promises.push(copy(file, ProyPath('public', bundle.dest, filename)).catch(() => {
						console.log(`error: ${file}.`);
					}));
				}
			}
		} else {
			for (const file of glob(bundle)) {
				compiled = true;
				fs.ensureDirSync(ProyPath('public', path.dirname(file)));
				promises.push(copy(file, ProyPath('public', file)).catch(() => {
					console.log(`error: ${file}.`);
				}));
			}
		}
		if (!compiled) {
			console.log(`Pattern: ${bundle.src} produce no result`);
		}
	}
	return Promise.all(promises).then(() => {
		console.log(`    -> Static Files Copied ${__ok.green}`);
	});
}
