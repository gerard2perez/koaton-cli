import * as fs from 'fs-extra';

export default function canAccess (path) {
	try {
		fs.accessSync(path);
		return true;
	} catch (e) {
		return false;
	}
}
