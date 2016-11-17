import 'colors';
import * as Promise from 'bluebird';
import * as fs from 'graceful-fs';
import * as glob from 'glob';
import * as path from 'upath';
import * as fse from 'fs-extra';
import utils from '../utils';
import command from '../command';

const UpdateModulesAssetsLinks = function UpdateModulesAssetsLinks(hbs, ext, regex) {
	let found,
		res = hbs;
		// console.log(hbs,ext,regex);
	while ((found = regex.exec(hbs)) !== null) {
		let target = scfg.bundles[`${found[1]}.${ext}`];
		if (target !== undefined) {
			console.log(target.file);
			let htmltag = ext === "css" ? `<link rel="stylesheet" href="/${path.join(scfg.name,target.file)}"/>` : `<script src="/${path.join(scfg.name,target.file)}"></script>`
			res = res.replace(found[0], htmltag);
		}
	}
	return res;
}
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
		hbs = UpdateModulesAssetsLinks(hbs, 'css', regex_css);
		hbs = UpdateModulesAssetsLinks(hbs, 'js', regex_js);
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
		promises.push(utils.copy(file, Dest(location, filename)));
	})
	return Promise.all(promises);
}
const preServe = `
`;
const Dest = function Dest(...args) {
	args.splice(0, 0, scfg.name);
	args.splice(0, 0, "koaton_module_package");
	return ProyPath.apply(this, args);
}
export default (new command(__filename, "Run the needed commands to"))
.Action(async function() {
	await Events("events", "pre", "modulify");
	utils.rmdir(Dest());
	utils.mkdir(Dest("controllers"));
	utils.mkdir(Dest("events"));
	utils.mkdir(Dest("views"));
	utils.mkdir(Dest("routes"));
	utils.mkdir(Dest("config"));
	utils.mkdir(Dest("commands"));
	process.stdout.write("update pre-asd\n");
	// await utils.shell("Building for production".green, ["koaton", "build", "-p"]);
	process.stdout.write("update post-sada\n");
	utils.copy(ProyPath("config", "ember.js"), Dest("config", "ember.js"));
	fse.copySync(ProyPath('public'), Dest("public"));
	// await ncp(ProyPath('public'), Dest("public"));
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
	utils.write(Dest("events", "pre_serve.js"), preServe);

	await Events("events", "post", "modulify", Dest());
});
