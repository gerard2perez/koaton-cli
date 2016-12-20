import * as Promise from 'bluebird';
import * as fs from 'fs-extra';
import * as path from 'upath';
import relpath from './relpath';

const _mkdir = Promise.promisify(fs.mkdirs);

export default function mkdir (file) {
	return _mkdir(path.normalize(file)).then(() => {
		console.log(`   ${'create'.cyan}: ${relpath(file)}`);
		return file;
	});
}
