const EAIEnum = ['name', 'mount', 'directory', 'access', 'adapter', 'subdomain', 'layout'];
const DefEAIEnum = ['emberapp', '/', '/emberapp', 'public', 'localhost', 'www', 'main'];
export default class EmberAppItem {
	constructor(application, data) {
		data.name = application;
		for (let property of EAIEnum) {
			Object.defineProperty(this, property, {
				enumerable: property !== 'name',
				value: data[property] || DefEAIEnum[property]
			});
		}
		Object.freeze(this);
	}
	valueOf() {
		return this.name;
	}
	equals(target) {
		return this.name === target.name;
	}
}
