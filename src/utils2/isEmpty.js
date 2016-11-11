import {readdirSync} from 'fs-extra';

export default function isEmpty(path) {
	try {
		var files = readdirSync(path);
		return !files || !files.length;
	} catch (e) {
		return true;
	}
}
