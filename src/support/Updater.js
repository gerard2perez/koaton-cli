export default class Updater {
	constructor(target, property, update) {
		Object.defineProperty(this, 'onupdate', {
			enumerable: true,
			value: update ? update : () => {}
		});
		Object.defineProperty(this, 'target', {
			enumerable: true,
			get: () => {
				return target[property];
			}
		});
	}
}
