import * as path from 'path';
import * as fs from 'fs-extra';
import 'colors';
import adapters from '../support/Adapters';
import engines from '../support/Engines';
import welcome from '../welcome';
import utils from '../utils';
import command from '../command';
import secret from '../secret';

let proypath = "";
let application = "";
let Project;

const makeLink=function makeLink(module){
	try {
		fs.symlinkSync(path.join(__dirname, `/../../../${module}`), ProyPath("/node_modules",module));
		console.log("Linked:"+module+": done".green);
	} catch (e) {
		console.log("Linked:"+module+": already exists".green);
	}
}

const setupInit = async function setupInit() {
	await utils.mkdir(Project());
	await utils.mkdir(Project("ember"));
	utils.render(TemplatePath('app.js'), Project('app.js'));
	await utils.copy(TemplatePath("./.gitignore"), Project('./.gitignore'));
}
const setupConfig = async function setupConfig(app) {
	await utils.mkdir(Project("config"));
	utils.render(TemplatePath('config/models.js'), Project('config/models.js'));
	utils.render(TemplatePath('config/views.js'), Project('config/views.js'));
	utils.render(TemplatePath('config/inflections.js'), Project('config/inflections.js'));
	utils.render(TemplatePath('config/ember.js'), Project('config/ember.js'));
	utils.render(TemplatePath('config/copy.js'), Project('config/copy.js'));
	utils.render(TemplatePath('config/server.js'), Project('config/server.js'), {
		key: `"${(await secret(48)).toString('hex')}"`
	});
	utils.render(TemplatePath('config/connections.js'), Project('config/connections.js'), {
		database: app
	});
	utils.render(TemplatePath('config/bundles.js'), Project('config/bundles.js'));
	utils.render(TemplatePath('config/security.js'), Project('config/security.js'));

}
const setupAssets = async function setupAssets() {
	await utils.mkdir(Project("assets", "img"));
	await utils.copy(TemplatePath("/public/img/koaton.png"), Project('assets/img/logo.png'));
	await utils.copy(TemplatePath("/public/img/koaton2.png"), Project('assets/img/logo2.png'));
	await utils.mkdir(Project("assets", "js"));
	await utils.mkdir(Project("assets", "css"));
	await utils.copy(TemplatePath("koaton-char.png"), Project("assets/favicon.ico"));
}
const setupOthers = async function setupOthers() {
	await utils.mkdir(Project("node_modules"));
	makeLink('koaton');
	makeLink('koaton-cli');
	await utils.mkdir(Project("routes"));
	await utils.copy(TemplatePath("/routes/index.js"), Project("/routes/index.js"));
	await utils.mkdir(Project("controllers"));
	await utils.mkdir(Project("models"));
	await utils.mkdir(Project("public"));
	await utils.mkdir(Project("public", "img"));
	await utils.mkdir(Project("views", "layouts"));
	await utils.copy(TemplatePath("/views/layouts/main.handlebars"), Project("/views/layouts/main.handlebars"));
	utils.render(TemplatePath('/views/index.html'), Project('/views/index.html'), {
		application: application
	});
	utils.render(TemplatePath('bower.json'), Project('bower.json'), {
		application: application
	});
}
const setupDependencies = async function setupDependencies(options, db, eg) {
	const shell = utils.shell;
	let pk = requireNoCache(TemplatePath('/package.json'));
	pk.name = application;
	pk.dependencies[eg] = "x.x.x";
	if (eg === "handlebars") {
		pk.dependencies["handlebars-layouts"] = "x.x.x";
	}
	pk.dependencies[db.package] = "x.x.x";
	utils.write(Project("package.json"), JSON.stringify(pk, null, '\t'), null);
	if (!options.skipNpm) {
		welcome.line1(true);
		await shell("Installing npm dependencies", ["npm", "install", "--loglevel", "info"], proypath);
		await shell("Installing adapter " + db.package.green, ["npm", "install", db.package, "--save", "--loglevel", "info"], application);
		await shell("Installing engine " + eg.green, ["npm", "install", eg, "--save", "--loglevel", "info"], proypath);
		if (eg === "handlebars") {
			await shell("Installing engine " + "handlebars-layouts".green, ["npm", "install", "handlebars-layouts", "--save", "--loglevel", "info"], proypath);
		}
	}
	if (!options.skipBower) {
		await shell("Installing bower dependencies", ["bower", "install"], proypath);
	}
	pk = requireNoCache(Project('package.json'));
	pk.dependencies.koaton = 'x.x.x';
	pk.dependencies["koaton-cli"] = 'x.x.x';
	utils.write(Project("package.json"), JSON.stringify(pk, null, '\t'), null);
}
const ArrayToDescription = function ArrayToDescription(array) {
	return "A value from [ ".yellow +
		Object.keys(array).map(tx => tx.cyan).join(" | ".yellow) + " ]".yellow
}
export default (new command(__filename, 'Creates a new koaton aplication.'))
.Args("app_name")
	.Options([
		[
			"-d", "--db <driver>",
			ArrayToDescription(adapters)
		],
		[
			"-e", "--view-engine <engine>",
			ArrayToDescription(engines)
		],
		["-f", "--force", "Overrides the existing directory."],
		["-n", "--skip-npm", "Omits npm install"],
		["-b", "--skip-bower", "Omits bower install"]
	])
	.Action(async function(app_name, options) {
		if (!app_name) {
			console.log('The command requires a name to run.\n\tkoaton new -h\nto see help.'.yellow);
			return 0;
		}
		Project = ProyPath.bind(ProyPath, app_name);
		application = app_name;
		proypath = ProyPath(app_name);
		var ok = await utils.challenge(proypath, `destination ${proypath.yellow} is not empty, continue?`, options.force);
		if (ok) {
			// process.stdin.destroy();
			try {
				await setupInit(app_name);
				await setupAssets(app_name);
				await setupConfig(app_name);
				await setupOthers(app_name);
				await setupDependencies(options, adapters.isOrDef(options.db), engines.isOrDef(options.viewEngine));
				await utils.shell("Initializing git".green, ["git", "init"], proypath);
			} catch (e) {
				console.log(e.stack);
			}
			welcome.line1(true);
			console.log("   To run your app first: ");
			console.log('     $' + ' cd %s '.bgWhite.black, application);
			console.log('   and then: ');
			console.log('     $' + ' koaton serve '.bgWhite.black);
			welcome.line3("or");
			console.log('     $' + 'cd %s && koaton serve \n'.bgWhite.black, application);
		}
		console.log(!ok);
		return !ok;
	});
