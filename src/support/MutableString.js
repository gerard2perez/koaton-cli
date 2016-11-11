export default class MutableString extends String {
	constructor(value, transforms) {
		super(value);
		for (const transform of transforms.split(' ')) {
			this.add(transform);
		}
	}
	add(transform) {
		let [target, value] = transform.split(':');
		Object.defineProperty(this, target, {
			enumerable: true,
			writable: false,
			value: value === "undefined" ? undefined : value

		})
	}
}
