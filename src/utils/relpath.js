import * as path from 'upath';

export default function relpath (file) {
	const head = path.basename(file);
	const body = file.replace(path.join(process.cwd(), '/'), '').replace(head, '');
	return body + head.green;
}
