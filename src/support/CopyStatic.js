import { sync as glob } from 'glob';
import * as path from 'upath';
import copy from '../utils/copy';
import * as fs from 'fs-extra';

export default function copystatic () {
	const config = requireNoCache(ProyPath('config', 'static'), {default: {}}).default.copy;
	let promises = [];
	for (const bundle of config) {
		if (typeof bundle === 'object') {
			for (const pattern of bundle.src) {
				for (const file of glob(pattern)) {
					let filename = file;
					if (bundle.flatten) {
						filename = path.basename(file);
					}
					fs.ensureDirSync(ProyPath('public', bundle.dest));
					promises.push(copy(file, ProyPath('public', bundle.dest, filename)));
				}
			}
		} else {
			for (const file of glob(bundle)) {
				fs.ensureDirSync(ProyPath('public', path.dirname(file)));
				promises.push(copy(file, ProyPath('public', file)));
			}
		}
	}
	return Promise.all(promises).then(() => {
		console.log(`    -> Static Files Copied ${__ok.green}`);
	});
}
