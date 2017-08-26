import { readFile } from 'fs-extra';
import { extname } from 'upath';
import write from './write';

function encoding (ext) {
	return null;
	// switch (ext) {
	// 	case '.ico':
	// 	case '.png':
	// 	case '.jpg':
	// 		return null;
	// 	default:
	// 		return 'utf-8';
	// }
}

export default function copy (...args) {
	let [from, to, mode] = args;
	return readFile(from, {
		encoding: encoding(extname(from))
	}).then(data => write(to, data, mode));
}
