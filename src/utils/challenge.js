import canAccess from './canAccess';

function prompt (msg) {
	return new Promise(function (resolve) {
		process.stdout.write(msg);
		process.stdin.setEncoding('utf8');
		process.stdin.once('data', function (val) {
			resolve(val.trim());
		}).resume();
	});
}

export default async function challenge (location, message, force) {
	let ok = true;
	if (canAccess(location) && !force) {
		ok = await prompt(`${message} [y/n]: `); // TODO: I don't know how to write in the stdin while running the tests ...
	}
	return ok;
}
