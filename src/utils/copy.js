import * as Promise from 'bluebird';
import {
	readFile
} from 'fs-extra';
import {
	extname
} from 'upath';
import write from './write';

function encoding(ext) {
	switch (ext) {
		case ".png":
		case ".jpg":
			return null;
		default:
			return "utf-8";
	}
}

export default function copy_async(...args) {
	let [from, to, mode] = args;
	return Promise.promisify(readFile)(from, {
			encoding: encoding(extname(from))
		})
		.then(data => write(to, data, mode)).catch( () => { return null;});
}
