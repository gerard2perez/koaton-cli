import 'colors';
import * as fs from 'fs-extra';
import * as path from 'upath';
import writemodes from './writemodes';
import relpath from './relpath';


export default function write_sync(...args) {
	let [file, content, mode] = args;
	file = path.normalize(file);
	try {
		fs.writeFileSync(file, content);
		let label;
		switch (mode) {
			case writemodes.update:
				label = "update".cyan + ":";
				break;
			case writemodes.create:
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
	} catch (e) {
		console.log(e.stack);
	}
	return null;
}
