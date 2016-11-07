import Updater from './Updater';

export default class ObjectArray extends Updater {
	toJSON() {
		return this.target;
	}
	constructor(typeofelements, ...args) {
		super(...args);
		Object.defineProperty(this, 'mutable', {
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
	has(mutable_item) {

		for (const nameditem in this.target) {
			const item = this.target[nameditem];
			if (mutable_item instanceof this.mutable) {
				if (item.equals(mutable_item)) {
					return true;
				}
			} else {
				if (item.valueOf() === mutable_item) {
					return true;
				}
			}
		}
		return false;
	}
	item(itemname) {
		for (const item of this.target) {
			if (item.valueOf() === itemname) {
				return item;
			}
		}
		return undefined;
	}
	add(...args) {
		let item = null;
		switch (args.length) {
			case 1:
				item = args[0];
				break;
			case 2:
				item = new this.mutable(...args, this.onupdate);
				break;
			default:
				throw 'unexpected amount of parameters';
		}
		if (!this.has(item)) {
			if (this.isarray) {
				this.target.push(item);
			} else {
				this.target[item.valueOf()] = item;
			}
			this.onupdate(item, "a");
		}
		return this;
	}

	[Symbol.iterator]() {
		let keys = Object.keys(this.target),
			index = -1;
		return {
			next: () => ({
				value: this.target[keys[++index]],
				done: !(index < keys.length)
			})
		};
	}
	remove(mutable_item) {
		let idx = "";
		for (const nameditem in this.target) {
			const item = this.target[nameditem];
			if (item.equals(mutable_item)) {
				idx = nameditem;
			}
		}
		delete this.target[idx];
		return this;
	}
}
