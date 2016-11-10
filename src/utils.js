import * as fse from 'fs-extra';
import * as fs from 'graceful-fs';
import * as mkdirp from 'mkdirp';
import * as path from 'upath';
import * as Promise from 'bluebird';
import * as spawn from 'cross-spawn';
import * as prompt from 'co-prompt';
import {
	exec
} from 'child_process';
import spin from './spinner';

const spinner = spin();
let shelllog = "";
export default {
	challenge: async function callenge(location, message, force) {
		let ok = true;
		if (this.canAccess(location) && !force) {
			ok = await prompt.confirm(`${message} [y/n]: `); //TODO: I don't know how to write in the stdin while running the tests ...
		}
		return ok;
	},
	log(text) {
		if (process.stdout.isTTY) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
		}
		process.stdout.write(text);
	},
	nlog(text) {
		if (process.stdout.isTTY) {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
		}
		process.stdout.write(text + '\n');

	},
	no_print: -1,
	print: 1,
	spawn: spawn,
	exec: (cmd, cfg) => {
		let opts = Object.assign({}, cfg);
		return new Promise((resolve) => {
			try {
				const child = exec(cmd, opts, (err, stdout, stderr) => {
					return err ? resolve(err) : resolve({
						stdout: stdout,
						stderr: stderr
					})
				});
				if (opts.stdout) {
					child.stdout.pipe(opts.stdout);
				}
				if (opts.stderr) {
					child.stderr.pipe(opts.stderr);
				}
			} catch (e) {
				console.log("ërror");
				resolve(e);
			}
		});
	},
	shell_log: () => {
		return shelllog;
	},
	shell: Promise.promisify((display, command, ...args) => {
		let [cwd, cb] = args;
		shelllog = "";
		if (cb === undefined) {
			cb = cwd;
			cwd = process.cwd();
		}
		if ( skipshell ) {
			console.log( `+ ${display}\t${__ok}`.green );
			cb(null,0);
			return;
		}
		let buffer = "";
		let c = null;
		const output = function(data) {
			shelllog += data.toString();
			buffer += data.toString();
			if (buffer.indexOf('\n') > -1) {
				let send = buffer.toString().split('\n');
				spinner.pipe({
					action: "extra",
					msg: send[0].substr(0, 150).replace(/\n/igm, "")
				});
				buffer = "";
			}
		};
		try {
			const child = spawn(command[0], command.slice(1), {
				cwd: path.join(cwd, "/"),
				shell: true
			});
			spinner.start(50, display, undefined, process.stdout.columns).then(() => {
				(cb || (() => {
					console.log("No Callback".red)
				}))(null, c || child.exitCode);
			}, (err) => {
				(cb || (() => {
					console.log("No Callback".red)
				}))(err, c || child.exitCode);
			});
			child.stderr.on('data', output);
			child.stdout.on('data', output);
			child.on('close', function(code) {
				c = code;
				const msg = code === 0 ? __ok.green : __nok.red;
				spinner.end(`+ ${display}\t${msg}`.green);
			});
		} catch (err) {
			console.log(err.stack.red);
		}
	}),
	_write: Promise.promisify(fs.writeFile),
	writeuseslog: undefined,
	writeSync(...args) {
		let [file, content, mode] = args;
		let printfn = this.writeuseslog ? this.writeuseslog : console.log;
		file = path.normalize(file);
		fs.writeFileSync(file, content);
		if (this.canAccess(file)) {
			const head = path.basename(file);
			const body = file.replace(path.join(process.cwd(), "/"), "").replace(head, "");
			if (mode !== null) {
				printfn(`   ${mode?'update':'create'}`.cyan + ': ' + body + head.green);
			}
			return file;
		} else {
			return null;
		}
	},
	encoding: (ext) => {
		switch (ext) {
			case ".png":
			case ".jpg":
				return null;
			default:
				return "utf-8";
		}
	},
	Copy(from, to, opts) {
		return this.read(from, opts).then((data) => {
			return this._write(to, data, opts);
		});
	},
	copy(...args) {
		let [from, to] = args;
		to = to || from;
		return this.read(from, {
			encoding: this.encoding(path.extname(from))
		}).then((data) => {
			return this.writeSync(to, data);
		}).catch((e) => {
			console.log(e.red);
			return false;
		});
	},
	new_compile_(...args) {
		let [text, options] = args;
		for (let prop in options) {
			text = text.split("{{" + prop + "}}").join(options[prop]);
		}
		return text;
	},
	render(source, dest, compiling_data) {
		const head = path.basename(dest);
		const body = dest.replace(path.join(process.cwd(), "/"), "").replace(head, "");
		let raw = fs.readFileSync(source, 'utf-8');
		let compiled = this.new_compile_(raw, compiling_data);
		fs.writeFileSync(dest, compiled);
		console.log(`   ${'create'.cyan}: ${body}${head.green}`);
		return {
			raw: raw,
			compiled: compiled
		};
	},
	read: Promise.promisify(fs.readFile),
	mkdir: Promise.promisify(function(...args) {
		let [file, mode, cb] = args;
		file = path.normalize(file);
		if (cb === undefined && typeof mode === "function") {
			cb = mode;
			mode = undefined;
		}
		if (this.canAccess(file)) {
			cb(null, true);
		} else {
			mode = mode || 1;
			mkdirp(file, '0755', function(err) {
				if (err) {
					throw err;
				}
				const location = file;
				file = file.replace(path.join(process.cwd(), "/"), "");
				const head = path.basename(file);
				if (mode !== -1) {
					console.log('   create'.cyan + ': ' + file.replace(head, "") + head.green);
				}
				(cb || (() => {
					console.log("No Callback".red);
				}))(null, location);
			});
		}
	}),
	canAccess(path) {
		try {
			fs.accessSync(path);
			return true;
		} catch (e) {
			return false;
		}
	},
	rmdir: fse.removeSync,
	isEmpty(path) {
		try {
			var files = readDir(path);
			return !files || !files.length;
		} catch (e) {
			return true;
		}
	}
};
