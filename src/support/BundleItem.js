import * as path from 'upath';
import { watch as Watch } from 'chokidar';

const bundletemplates = {
	'.css': (file) => {
		return `<link rel='stylesheet' href='${file}'>`;
	},
	'.js': (file) => {
		return `<script src='${file}'></script>`;
	}
};

/**
 * Represents a Bundle Item used by the template engines to render .css or .js files.
 * @class BundleItem
 * @alias module:support/BundleItem.default
 * @param {string} target Identifier that will be use as name of the bundle.
 * @param {string|string[]} source File(s) that will be bundled.
 */
export default class BundleItem {
	/**
 	* @param {String} target - Identifier that will be use as name of the bundle.
 	* @param {String|String[]} source - File(s) that will be bundled.
	* @param {Boolean} watch - watch source files for changes.
 	*/
	constructor (target, source, watch = false) {
		/**
		 * This variable is used to store the sorces files of the package.
		 * @private
		 * @type {String[]}
		 */
		this.sources = [];
		/**
		 * This This is the function that will be triggered when a change in the source files is detected.
		 * @private
		 * @type {function}
		 */
		this.watchfn = null;
		/**
		 * If watch option is enabled a chockidar instance will be created in order to listen changes in the sources files
		 * @private
		 * @type {Chockidar}
		 */
		this.watcher = null;

		/**
		 * @private
		 * @property {string} kind package kind [.js | .css]
		 */
		Object.defineProperty(this, 'kind', {
			enumerable: false,
			value: target.replace(path.trimExt(target), '') // .replace('.', '')
		});
		Object.defineProperty(this, 'file', {
			enumerable: true,
			value: target
		});
		Object.defineProperty(this, 'content', {
			writable: true,
			enumerable: false,
			value: source instanceof Array ? source : (source ? [source] : [])
		});
		if (watch) {
			this.watcher = new Watch(this.content, {
				persistent: true,
				ignoreInitial: true,
				alwaysStat: false,
				awaitWriteFinish: {
					stabilityThreshold: 300,
					pollInterval: 100
				}
			});
		}
	}
	async build (logger, builder) {
		try {
			this.sources.forEach(f => {
				this.watcher.unwatch(f);
			});
		} catch (Ex) { }
		let data = await builder(this.file, this.content.slice(0), configuration.server.env === 'development', false, logger);
		let sources = [];
		let files = [];
		for (const key in data) {
			files.push(key);
			sources = sources.concat(data[key]);
		}
		this.sources = sources;
		sources.forEach(f => {
			this.watcher.add(f);
		});
		return files;
	}
	valueOf () {
		return this.file;
	}
	watch (fn) {
		if (!this.watcher) {
			this.watcher = new Watch(this.content, {
				persistent: true,
				ignoreInitial: true,
				alwaysStat: false,
				awaitWriteFinish: {
					stabilityThreshold: 300,
					pollInterval: 100
				}
			});
			this.content.forEach(f => {
				this.watcher.unwatch(f);
			});
		}
		this.watchfn = fn;
		this.watcher.on('change', fn);
	}
	/**
	 * Adds a new filepath to the bundle.
	 * @param {String} item - File location of the file to add.
	 * @return {BundleItem} - Returns the BundleItem instace for chaining.
	 */
	add (item) {
		if (this.content.indexOf(item) === -1) {
			this.content.push(item);
		}
		return this;
	}
	/**
	 * Remove a single item and unwatch it if needed.
	 * @param {String} - The item to be removed.
	 */
	remove (item) {
		if (this.content.indexOf(item) > -1) {
			let [Item] = this.content.splice(this.content.indexOf(item), 1);
			if (this.watcher) {
				this.watcher.unwatch(Item);
			}
		}
		return this;
	}
	/**
	 * Removes all files added to the bundle.
	 * @return {BundleItem} - Returns the BundleItem instace for chaining.
	 */
	clear () {
		while (this.content.length > 0) {
			let item = this.content.pop();
			if (this.watcher) {
				this.watcher.unwatch(item);
			}
		}
		return this;
	}
	/**
	 * Compares two BundleItem and returns true is equal.
	 * @param {BundleItem} target - BundleItem to campare to.
	 * @return {Boolean} - true if they are equal false otherwise.
	 */
	equals (target) {
		return this.file === target.file;
	}
	/**
	 * Makes sure that calling JSON.stringify return an array with the source files.
	 * @return {String[]} - Return the value of the source files.
	 */
	toJSON () {
		return this.content;
	}
	/**
	 * Returns the representation of the bundle in <link rel='stylesheet' href='...'> or <script src='...'></script> format.
	 * @return {String}
	 */
	toString () {
		let res = '';
		for (const idx in this.content) {
			res += bundletemplates[this.kind](this.content[idx]);
		}
		return res;
	}
	/**
	 * Return an iterator that can be use with for ... of
	 * @alias BundleItem#iterator
	 * @return {Symbol.iterator}
	*/
	[ Symbol.iterator] () {
		let index = -1;
		return {
			next: () => ({
				value: this.content[++index],
				done: !(index < this.content.length)
			})
		};
	}
}
