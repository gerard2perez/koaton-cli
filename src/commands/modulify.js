import 'colors';
import * as Promise from 'bluebird';
import * as _ncp from 'ncp';
import * as fs from 'graceful-fs';
import * as glob from 'glob';
import * as path from 'upath';
import utils from '../utils';
import command from '../command';

const ncp = Promise.promisify(_ncp.ncp);

export default (new command(__filename, "Run the needed commands to"))
.Action(async function() {
	await Events("events", "pre", "modulify");
	utils.rmdir(Dest());
	await utils.shell("Building for production".green, ["koaton", "build", "-p"]);
	utils.mkdir(Dest("controllers"));
	utils.mkdir(Dest("events"));
	utils.mkdir(Dest("views"));
	utils.mkdir(Dest("routes"));
	utils.mkdir(Dest("config"));
	utils.mkdir(Dest("commands"));
	utils.Copy(ProyPath("config", "ember.js"), Dest("config", "ember.js"))
	await ncp(ProyPath('public'), Dest("public"));
	await copyall("commands");
	await copyall("controllers");
	await copyall("events");
	await copytemplates("views");
	await copyall("routes");

	Object.keys(require(ProyPath("config", "ember"))).forEach((ember_app) => {
		utils.rmdir(Dest("public", ember_app, "index.html"));
		utils.rmdir(Dest("public", ember_app, "crossdomain.xml"));
		utils.rmdir(Dest("public", ember_app, "robots.txt"));
	});

	utils.rmdir(Dest("events", "pre_modulify.js"));
	utils.rmdir(Dest("events", "post_modulify.js"));
	utils.writeSync(Dest("events", "pre_serve.js"), preServe);

	try {
		await Events("events", "post", "modulify", Dest());
	} catch (e) {
		console.log(e.stack);
	}
});

const copytemplates = async function copytemplates(folder) {

	const files = glob.sync(ProyPath(folder, "**", "*.?(js|handlebars)"));
	for (let idx in files) {
		let file = path.normalize(files[idx]);
		let filename = path.basename(file);
		let location = file.replace(filename, "").replace(path.normalize(process.cwd()), "");
		await utils.mkdir(Dest(location));
		let regex_css = /\{\{\{bundle "([^ "]*).css"\}\}\}/igm;
		let regex_js = /\{\{\{bundle "([^ "]*).js"\}\}\}/igm;
		let hbs = fs.readFileSync(file, 'utf-8');
		let found;
		while ((found = regex_css.exec(hbs)) !== null) {
			let target = scfg.bundles[`${found[1]}.css`];
			if (target !== undefined) {
				hbs = hbs.replace(found[0], `<link rel="stylesheet" href="/${path.join("koaton_toolkit",target)}"/>`);
			}
		}
		while ((found = regex_js.exec(hbs)) !== null) {
			let target = scfg.bundles[`${found[1]}.js`];
			if (target !== undefined) {
				hbs = hbs.replace(found[0], `<script src="/${path.join("koaton_toolkit",target)}"></script>`);
			}
		}
		fs.writeFileSync(Dest(location, filename), hbs);
	}
}
const copyall = function copyall(folder) {
	let promises = [];
	glob.sync(ProyPath(folder, "**", "*.?(js|handlebars)")).forEach(function(...args) {
		let file = path.normalize(args[0]);
		let filename = path.basename(file);
		let location = file.replace(filename, "").replace(path.normalize(process.cwd()), "");
		utils.mkdir(Dest(location));
		promises.push(utils.Copy(file, Dest(location, filename)));
	})
	return Promise.all(promises);
}
const preServe = `
`;
const Dest = function Dest(...args) {
	//args.splice(0, 0, "modulifyoutput");
	args.splice(0, 0, "koaton_toolkit");
	args.splice(0, 0, "koaton_modules");
	args.splice(0, 0, "myclinic");
	args.splice(0, 0, "..");
	return ProyPath.apply(this, args);
}
