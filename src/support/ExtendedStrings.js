import MutableString from './MutableString';


function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export default class ExtendedStrings {
	constructor(baseprop) {
		Object.defineProperty(this, 'privot', {
			enumerable: false,
			writable: true,
			value: {}
		})
		this.baseProperty = baseprop;
	}
	add(...args) {
		let [target, transforms,alias]=args;
		if (target.indexOf(":") === -1) {
			alias=target;
			this.privot[target] = new MutableString(target, transforms);
			Object.defineProperty(this.privot[target], this.baseProperty, {
				configurable:false,
				enumerable: false,
				writable: true,
				value: target
			});
			Object.freeze(this.privot[target]);
		} else {
			[alias,target] = target.split(':');
		}
		Object.defineProperty(this, capitalize(alias), {
			enumerable: false,
			get() {
				//TODO: console.log(`Deprecated: Please use only lower strings for the models datatypes (${capitalize(datatype)})`.yellow);
				return this.privot[target];
			}
		});
		Object.defineProperty(this, alias, {
			enumerable: true,
			get() {
				return this.privot[target];
			}
		})
	}
}
