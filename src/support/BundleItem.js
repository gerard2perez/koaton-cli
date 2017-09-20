import * as path from 'upath';
import { watch as Watch } from 'chokidar';
import { buildCSS, buildJS } from '../commands/build';

const builder = {
	css: buildCSS,
	js: buildJS
};
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
	async build (logger) {
		try {
			this.sources.forEach(f => {
				this.watcher.unwatch(f);
			});
		} catch (Ex) { }
		let data = await builder[this.kind](this.file, this, configuration.server.env === 'development', false, logger);
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
	constructor (target, source, watch = false) {
		this.sources = [];
		Object.defineProperty(this, 'kind', {
			enumerable: false,
			value: target.replace(path.trimExt(target), '').replace('.', '')
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
	add (item) {
		if (this.content.indexOf(item) === -1) {
			this.content.push(item);
		}
		return this;
	}
	remove (item) {
		if (this.content.indexOf(item) > -1) {
			this.content.splice(this.content.indexOf(item), 1);
		}
		return this;
	}
	clear () {
		while (this.content.length > 0) {
			this.watcher.unwatch(this.content.pop());
		}
		return this;
	}
	equals (target) {
		return this.file === target.file;
	}
	toJSON () {
		return this.content;
	}
	toString () {
		let res = '';
		for (const idx in this.content) {
			res += bundletemplates[this.kind](this.content[idx]);
		}
		return res;
	}
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
