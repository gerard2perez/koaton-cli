import 'colors';
import * as Promise from 'bluebird';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'upath';
import utils from '../utils';
import Command from '../Command';

const UpdateModulesAssetsLinks = function UpdateModulesAssetsLinks (hbs, ext, regex) {
	let found,
		res = hbs;
	while ((found = regex.exec(hbs)) !== null) {
		let target = scfg.bundles[`${found[1]}.${ext}`];
		if (target !== undefined) {
			let htmltag = ext === 'css' ? `<link rel='stylesheet' href='/${path.join(scfg.name, target.file)}'/>` : `<script src='/${path.join(scfg.name, target.file)}'></script>`;
			res = res.replace(found[0], htmltag);
		}
	}
	return res;
};
const copytemplates = async function copytemplates (folder) {
	const files = glob.sync(ProyPath(folder, '**', '*.*'));
	for (let idx in files) {
		let file = path.normalize(files[idx]);
		let filename = path.basename(file);
		let location = file.replace(filename, '').replace(path.normalize(process.cwd()), '');
		await utils.mkdir(Dest(location), null);
		let regexCSS = /\{\{\{bundle '([^ ']*).css'\}\}\}/igm;
		let regexJS = /\{\{\{bundle '([^ ']*).js'\}\}\}/igm;
		let hbs = fs.readFileSync(file, 'utf-8');
		hbs = UpdateModulesAssetsLinks(hbs, 'css', regexCSS);
		hbs = UpdateModulesAssetsLinks(hbs, 'js', regexJS);
		if (location.indexOf('layouts') > -1) {
			filename = `${scfg.name}.${filename}`;
		}
		utils.write(Dest(location, filename), hbs, 2);
	}
};
const copyall = function copyall (folder) {
	let promises = [];
	glob.sync(ProyPath(folder, '**', '*.js')).forEach(function (...args) {
		let file = path.normalize(args[0]);
		let filename = path.basename(file);
		let location = file.replace(filename, '').replace(path.normalize(process.cwd()), '');
		utils.mkdir(Dest(location), null);
		promises.push(utils.copy(file, Dest(location, filename), 2));
	});
	return Promise.all(promises);
};
const Dest = function Dest (...args) {
	args.splice(0, 0, scfg.name);
	args.splice(0, 0, 'koaton_module_package');
	return ProyPath.apply(this, args);
};
export default (new Command(__filename, 'Run the needed commands to'))
	.Action(async function () {
		await Events('events', 'pre', 'modulify');
		fs.emptyDirSync(Dest());

		await utils.mkdir(Dest('commands'));
		await copyall('commands');

		await utils.mkdir(Dest('config'));
		await utils.copy(ProyPath('config', 'ember.js'), Dest('config', 'ember.js'), 2);
		await utils.copy(ProyPath('config', 'server.js'), Dest('config', 'server.js'), 2);

		await utils.mkdir(Dest('controllers'));
		await copyall('controllers');

		await utils.mkdir(Dest('events'));
		await copyall('events');

		await utils.mkdir(Dest('models'));
		await copyall('models');

		await utils.mkdir(Dest('views'));
		await copytemplates('views');

		fs.copySync(ProyPath('public'), Dest('public'));

		await utils.copy(ProyPath('routes.js'), Dest('routes.js'), 2);

		Object.keys(configuration.ember).forEach((emberAPP) => {
			utils.rmdir(Dest('public', emberAPP, 'index.html'));
			utils.rmdir(Dest('public', emberAPP, 'crossdomain.xml'));
			utils.rmdir(Dest('public', emberAPP, 'robots.txt'));
		});

		utils.rmdir(Dest('events', 'pre_modulify.js'));
		utils.rmdir(Dest('events', 'post_modulify.js'));

		await Events('events', 'post', 'modulify', Dest());
	});
