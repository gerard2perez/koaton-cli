import * as fs from 'fs-extra';
import * as path from 'path';

export default function makeLink(module) {
	// console.log(path.join(__dirname, `/../../../${module}`));
	fs.ensureSymlinkSync(path.join(__dirname, `/../../../${module}`), ProyPath("/node_modules", module));
	console.log("Linked:" + module + ": done".green);
}
