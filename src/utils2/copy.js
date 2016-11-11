import * as Promise from 'bluebird';
import {
	readFile
} from 'graceful-fs';
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
	to = to || from;
	return Promise.promisify(readFile)(from, {
			encoding: encoding(extname(from))
		})
		.then(data => write(to, data, mode))
		.catch(e => {
			console.log(e.red);
			return null;
		});
}
