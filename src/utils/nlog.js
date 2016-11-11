export default function nlog(text) {
	if (process.stdout.isTTY) {
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
	}
	process.stdout.write(text + '\n');

}
