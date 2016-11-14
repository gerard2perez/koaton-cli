import * as Promise from 'bluebird';
import * as fs from 'fs-extra';
import * as path from 'upath';
import relpath from './relpath';

const mkdir = Promise.promisify(fs.mkdirs);

export default function mkdir_async(file) {
	return mkdir(path.normalize(file)).then(() => {
		console.log(`   ${"create"}.cyan: ${relpath(file)}`);
		return file;
	},(e)=>{
		console.log(e);
	});
}
