import * as crypto from 'crypto';
import { readFile } from 'fs';
import { promisify } from 'util';

const read = promisify(readFile);
export default async function hashfile (file, content = null) {
	const hasher = crypto.createHash('sha1');
	if (!content) {
		content = await read(file);
		hasher.update(content);
	}
	hasher.update(content);
	return hasher.digest('hex');
}
