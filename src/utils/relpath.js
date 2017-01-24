import * as path from 'upath';

export default function relpath (file) {
	const head = path.basename(file).replace('/', '');
	const body = file.replace(path.join(process.cwd(), '/'), '').replace(head, '').replace('//', '/');
	return body + head.green;
}
