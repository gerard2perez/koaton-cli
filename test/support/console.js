const log = console.log;
let buffer = [];

export default {
	log () {
		return buffer.join('\n');
	},
	init (restore) {
		if (restore) {
			console.log = log;
		} else {
			buffer = [];
			console.log = function (...args) {
				buffer = buffer.concat(args);
				// log(args);
			};

		}
	}
};
