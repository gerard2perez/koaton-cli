export default class CommandLog {
	constructor (target, property, update = () => {}) {
		Object.defineProperty(this, 'onupdate', {
			enumerable: false,
			value: update
		});
		Object.defineProperty(this, 'target', {
			enumerable: false,
			get () {
				return target[property];
			}
		});
	}
	add (cmd) {
		if (this.target.indexOf(cmd) === -1) {
			this.target.push(cmd);
			this.onupdate();
		}
	}
}
