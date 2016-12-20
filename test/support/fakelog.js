const log = process.stdout.write;
let buffer = [];

export default {
	log () {
		return buffer.join('\n');
	},
	init (restore) {
		if (restore) {
			process.stdout.write = log;
		} else {
			buffer = [];
			process.stdout.write = function (...args) {
				buffer = buffer.concat(args);
				// buffer = buffer.map(str => str.reset);
				log(args);
			};

		}
	}
};
