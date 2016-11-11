import * as Promise from 'bluebird';
import * as fs from 'fs-extra';
import * as path from 'upath';
import relpath from './relpath';

const mkdir = Promise.promisify(fs.mkdirs);

export default function mkdir_async(...args) {
	let [file, mode, cb] = args;
	file = path.normalize(file);
	if (cb === undefined && typeof mode === "function") {
		cb = mode;
		mode = undefined;
	}
	return mkdir(file).then(()=>{
		console.log(`   ${"create"}.cyan: ${relpath}`);
		return file;
	});
}
