export default class CommandLog {
	constructor(target,property, update) {
		Object.defineProperty(this, 'onupdate', {
			enumerable: false,
			value: update ? update : () => {}
		});
		Object.defineProperty(this, 'target', {
			enumerable: false,
			get:function(){
				return target[property];
			}
		});

	}
	add(cmd) {
		if (this.target.indexOf(cmd) === -1) {
			this.target.push(cmd);
			this.onupdate();
		}
	}
}
