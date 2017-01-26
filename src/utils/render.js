import * as fs from 'fs-extra';
import relpath from './relpath';
import compile from './compile';
import writemodes from './writemodes';

export default function render (source, dest, compilingData, mode = writemodes.create) {
	let raw = fs.readFileSync(source, 'utf-8');
	let compiled = compile(raw, compilingData);
	fs.outputFileSync(dest, compiled);
	let label;
	switch (mode) {
		case writemodes.update:
			label = 'update'.cyan + ':';
			break;
		case writemodes.create:
			label = 'create'.cyan + ':';
			break;
		default:
			label = null;
			break;
	}
	if (label !== null) {
		console.log(`   ${label} ${relpath(dest)}`);
	}
	return {
		raw: raw,
		compiled: compiled
	};
}
