import * as prompt from 'co-prompt';
import canAccess from './canAccess';

export default async function challenge(location, message, force) {
	let ok = true;
	if (canAccess(location) && !force) {
		ok = await prompt.confirm(`${message} [y/n]: `); //TODO: I don't know how to write in the stdin while running the tests ...
	}
	return ok;
}
