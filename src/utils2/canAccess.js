import * as fs from 'graceful-fs';

export default function canAccess(path) {
	try {
		fs.accessSync(path);
		return true;
	} catch (e) {
		return false;
	}
}
