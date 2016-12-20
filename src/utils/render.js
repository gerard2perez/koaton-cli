import * as fs from 'fs-extra';
import relpath from './relpath';
import compile from './compile';

export default function render (source, dest, compilingData) {
	let raw = fs.readFileSync(source, 'utf-8');
	let compiled = compile(raw, compilingData);
	fs.outputFileSync(dest, compiled);
	console.log(`   ${'create'.cyan}: ${relpath(dest)}`);
	return {
		raw: raw,
		compiled: compiled
	};
}
