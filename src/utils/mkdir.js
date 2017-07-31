import { mkdirs } from 'fs-extra';
import * as path from 'upath';
import relpath from './relpath';
import writemodes from './writemodes';

export default function mkdir (file, mode = 1) {
	return mkdirs(path.normalize(file)).then(() => {
		let label = '';
		switch (mode) {
			case writemodes.update:
			case writemodes.create:
				label = 'create'.cyan + ':';
				break;
			default:
				label = null;
				break;
		}
		if (label !== null) {
			console.log(`   ${label} ${relpath(file)}`);
		}
		return file;
	});
}
