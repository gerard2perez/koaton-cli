import 'colors';
import * as fs from 'fs-extra';
import * as path from 'upath';
import writemodes from './writemodes';
import relpath from './relpath';

export default function writeSync (...args) {
	let [file, content, mode] = args;
	if (content.indexOf('koaton:static') > -1) {
		return file;
	}
	file = path.normalize(file);
	try {
		fs.writeFileSync(file, content);
		let label;
		switch (mode) {
			case writemodes.update:
				label = 'update'.cyan + ':';
				break;
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
	} catch (e) {
		console.log(e.stack);
	}
	return null;
}
