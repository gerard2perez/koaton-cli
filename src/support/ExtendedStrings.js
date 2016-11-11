import MutableString from './MutableString';


function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export default class ExtendedStrings {
	constructor() {
		Object.defineProperty(this, 'adapters', {
			enumerable: false,
			writable: true,
			value: {}
		})
	}
	add(datatype, transforms) {
		this.adapters[datatype] = new MutableString(datatype, transforms);
		Object.defineProperty(this.adapters[datatype], 'koaton', {
			enumerable: false,
			writable: false,
			value: datatype
		});
		Object.freeze(this.adapters[datatype]);
		Object.defineProperty(this, capitalize(datatype), {
			enumerable: false,
			get() {
				//TODO: console.log(`Deprecated: Please use only lower strings for the models datatypes (${capitalize(datatype)})`.yellow);
				return this.adapters[datatype];
			}
		});
		Object.defineProperty(this, datatype, {
			enumerable: true,
			get() {
				return this.adapters[datatype];
			}
		})
	}
}
