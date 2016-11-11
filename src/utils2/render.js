import * as fs from 'fs-extra';
import relpath from './relpath';
import compile from './compile';

export default function render(source, dest, compiling_data) {
	let raw = fs.readFileSync(source, 'utf-8');
	let compiled = compile(raw, compiling_data);
	fs.outputFileSync(dest, compiled);
	console.log(`   ${'create'.cyan}: ${relpath(source)}`);
	return {
		raw: raw,
		compiled: compiled
	};
}
