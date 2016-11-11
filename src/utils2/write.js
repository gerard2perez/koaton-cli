import 'colors';
import * as fs from 'graceful-fs';
import * as path from 'upath';
import write_modes from './writemodes';
import canAccess from './canAccess';
import relpath from './relpath';


export default function write_sync(...args) {
	let [file, content, mode] = args;
	file = path.normalize(file);
	try {
		fs.writeFileSync(file, content);
		if (canAccess(file)) {
			let label;
			switch (mode) {
				case write_modes.update:
					label = "update".cyan + ":";
					break;
				case write_modes.create:
					label = "create".cyan + ":";
					break;
				default:
					label = null;
					break;
			}
			if (label !== null) {
				console.log(`   ${label} ${relpath(file)}`);
			}
			return file;
		}
	} catch (e) {
		return null,e;
	}
	return null;
}
