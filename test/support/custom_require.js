import * as path from 'path';

export default function requireNocache (lib) {
	let library = path.normalize(path.resolve(lib));
	delete require.cache[library];
	return require(library);
}
