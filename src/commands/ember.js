import 'colors';
import * as path from 'upath';
import * as buildcmd from './build';
import utils from '../utils';
import command from '../command';

let ember_proyect_path;
const newproyect = async function newproyect(app_name, options) {
	if (await utils.challenge(ember_proyect_path, `destination ${ember_proyect_path.yellow} is not empty, continue?`, options.force)) {
		//fs.removeSync(ember_proyect_path);
		await utils.shell(`Installing ${app_name.green}`, ["ember", "new", app_name, "-dir", ember_proyect_path], process.cwd());
		await utils.mkdir(path.join("ember", app_name, "app", "initializers"));
		await buildcmd.getInflections(app_name, true);
		return false;
	} else {
		return true;
	}
}

export default (new command(__filename, "Creates a new ember app with the especified named."))
.Args("app_name")
	.Options([
		["-l", "--list", "Shows all the ember apps of the project"],
		["-f", "--force", "Overrides the current app."],
		["-u", "--use <ember_addon>", "Install the especified addon in the especified app."],
		["-m", "--mount <path>", "(Default: /) Sets the mounting path in the koaton app. Can be used with -n or alone."],
		["-b", "--build <env>", "[ development | production] Builds the especified ember app in the Koaton app."],
		["--subdomain", "--subdomain <subdomain>", "(Default: www) Sets the subdomain to mount the application."],
		["--port", "--port <port>", "port to build"]
	])
	.Action(async function(app_name, options) {
		let res = false;
		if ((!app_name && !options.list) || (!app_name && !!(options.use || options.prod || options.build || options.port))) {
			console.log('   The command cannot be run this way.\n\tkoaton ember -h\n   to see help.'.yellow);
			return res;
		} else if (app_name && !utils.canAccess(ProyPath("ember", app_name)) && !!(options.use || options.prod || options.build || options.port)) {
			console.log("  That ember app does not exist.")
			return res;
		}
		ember_proyect_path = ProyPath("ember", app_name || "");
		if (options.list) {
			const dirs = readDir('./ember');
			dirs.forEach((dir) => {
				console.log(`${dir}@${require(ProyPath("ember",dir,"bower.json")).dependencies.ember}`);
			});
			if (dirs.length === 0) {
				console.log("  No Apps Installed");
			}
		} else if (options.use) {
			res = await utils.shell(`Installing ${options.use.green} addon on ${app_name.cyan}`, ["ember", "i", options.use], ember_proyect_path);
			console.log(!res ? "Success".green : "Failed".red);
		} else if (options.build) {
			const embercfg = require(ProyPath("config", "ember"))[app_name];
			res =  !(await buildcmd.preBuildEmber(app_name, embercfg) &&
			await buildcmd.buildEmber(app_name, {
				mount: embercfg.directory,
				build: options.build
			}) &&
			await buildcmd.postBuildEmber(app_name, embercfg));
		} else {
			const connections = require(ProyPath("config", "connections"));
			const connection = require(ProyPath("config", "models")).connection;
			const port = require(ProyPath("config", "server")).port;
			const host = connections[connection].host;
			options.mount = path.join('/', options.mount || "").replace(/\\/igm, "/");
			res = await newproyect(app_name, options);
			res &= !((await utils.mkdir(ProyPath("ember", app_name, "app", "adapters"))) &&
				utils.render(TemplatePath("ember_apps", "adapter.js"), ProyPath("ember", app_name, "app", "adapters", "application.js"), {
					localhost: host,
					port: port
				}));
			var emberjs = require(ProyPath("config", "ember.js"));
			emberjs[app_name] = {
				mount: options.mount,
				directory: app_name,
				access: "public",
				adapter: "localhost",
				subdomain: options.subdomain || "www",
				layout: "main"
			};
			await utils.write(ProyPath("config", "ember.js"), `"use strict";\n\nmodule.exports=${JSON.stringify(emberjs,2,2)};`, true);
			let embercfg = await utils.read(path.join(ember_proyect_path, "config", "environment.js"), {
				encoding: 'utf-8'
			});
			embercfg = embercfg.replace(/baseURL: ?'.*',/, `baseURL: '${options.mount}',`);
			await utils.write(path.join(ember_proyect_path, "config", "environment.js"), embercfg, true);
		}
		return res;
	});
