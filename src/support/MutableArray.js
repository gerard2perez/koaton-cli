import Updater from './Updater';

export default class ObjectArray extends Updater {
	toJSON () {
		return this.target;
	}
	constructor (typeofelements, ...args) {
		super(...args);
		Object.defineProperty(this, 'Mutable', {
			enumerable: true,
			value: typeofelements
		});
		this.isarray = this.target instanceof Array;
		if (!this.isarray) {
			makeObjIterable(this.target);
		}
		Object.defineProperty(this.target, 'toJSON', {
			get: () => {
				return this.toJSON.bind(this);
			}
		});
	}
	has (mutableItem) {
		for (const nameditem in this.target) {
			const item = this.target[nameditem];
			if (mutableItem instanceof this.Mutable) {
				if (item.equals(mutableItem)) {
					return true;
				}
			} else {
				return item.valueOf() === mutableItem;
			}
		}
		return false;
	}
	add (...args) {
		let item = null;
		switch (args.length) {
			case 1:
				item = args[0];
				break;
			default:
				item = new this.Mutable(...args, this.onupdate);
				break;
		}
		if (!this.has(item)) {
			if (this.isarray) {
				this.target.push(item);
			} else {
				this.target[item.valueOf()] = item;
			}
			Object.defineProperty(this, item.valueOf(), {
				configurable: true,
				enumerable: true,
				get () {
					return item;
				}
			});
			this.onupdate(item, 'a');
		}
		return this;
	}

	[Symbol.iterator] () {
		let keys = Object.keys(this.target),
			index = -1;
		return {
			next: () => ({
				value: this.target[keys[++index]],
				done: !(index < keys.length)
			})
		};
	}
	remove (...args) {
		let mutableItem = (args[0] instanceof this.Mutable ? args[0] : this[args[0]]);
		if (!mutableItem) {
			return this;
		}
		for (const item of this) {
			if (item.equals(mutableItem)) {
				if (this.isarray) {
					delete this.target.splice(this.target.indexOf(item), 1);
				} else {
					delete this.target[item.valueOf()];
					delete this[item.valueOf()];
				}
				this.onupdate(item, 'r');
				break;
			}
		}
		return this;
	}
}
