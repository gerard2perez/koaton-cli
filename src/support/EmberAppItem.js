const Defaults = {
	'name': 'emberapp',
	'mount': '/',
	'directory': '/emberapp',
	'access':'public',
	'adapter':'localhost',
	'subdomain':'www',
	'layout':'main'
}

export default class EmberAppItem {
	constructor(...args) {
		let [application, data] = args;
		data = Object.assign({},Defaults,data||{});
		data.name = application || Defaults.name;
		for (let property in Defaults) {
			Object.defineProperty(this, property, {
				enumerable: property !== 'name',
				value: data[property]
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
