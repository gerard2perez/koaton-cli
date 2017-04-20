import * as inflector from 'inflection';
import * as fs from 'fs-extra';

class TestNode {
	constructor (name, args, expect, rename) {
		this.asyncs = false;
		if (rename) {
			let terms = args.slice(0, args.length - 1);
			terms.push('');
			terms = terms.join(' ');
			let params = typeof args.last === 'object' ? args.last : {};
			name = ` ${terms}` + Object.keys(params).map((key) => {
				let newkey = inflector.dasherize(inflector.underscore(key));
				if (typeof params[key] === 'boolean') {
					return '--' + newkey;
				} else {
					return '--' + newkey + ' ' + params[key];
				}
			}).join(' ');
		}
		this.name = name;
		this.args = args;
		this.expect = expect instanceof Array ? expect : [expect];
		this.setup = null;
		this.cleanup = null;
		return this;
	}
	Exists (...path) {
		this.expect.push((buffer, dir) => {
			let file = ProyPath(...path);
			let absdir = file.replace(ProyPath(), '');
			let message = `File Not Found: ${absdir}`;
			return [message, true, fs.existsSync(file)];
		});
		return this;
	}
	Expect (message, expect, fn) {
		switch (arguments.length) {
			case 1:
				if (typeof message === 'function' && fn === undefined) {
					fn = message;
					message = undefined;
				}
				break;
			case 2:
				if (typeof message !== 'string' || typeof fn !== 'function') {
					console.log('rejected case 2');
					return this;
				}
				break;
			case 3:
				if (typeof message !== 'string' || typeof fn !== 'function') { // } || typeof expect !== 'boolean') {
					console.log(message, fn, expect);
					console.log('rejected case 3');
					return this;
				}
				break;
			default:
				console.log('rejected default');
				return this;

		}
		this.expect.push((buffer, dir) => {
			return [message, expect === undefined ? true : expect, fn(buffer, dir)];
		});
		return this;
	}
	SetUp (fn) {
		if (typeof fn === 'function') {
			this.setup = fn;
		} else if (typeof this.setup === 'function') {
			this.setup();
		}
		return this;
	}
	CleanUp (fn) {
		if (typeof fn === 'function') {
			this.cleanup = fn;
		} else if (typeof this.cleanup === 'function') {
			this.cleanup();
		}
		return this;
	}
}
export default TestNode;
