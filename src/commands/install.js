import 'colors';
import * as path from 'upath';
import * as fs from 'fs';
import utils from '../utils';
import command from '../command';

const makeLink=function makeLink(module){
	try {
		fs.symlinkSync(path.join(__dirname, `/../../../${module}`), ProyPath("/node_modules",module));
		console.log("Linked:"+module+": done".green);
	} catch (e) {
		console.log("Linked:"+module+": already exists".green);
	}
}

export default (new command(__filename, "SetUps a recent clonned proyect. (root/Administrator permission needed to work with nginx)"))
.Args()
	.Options()
	.Action(async function() {
		await utils.shell("finding nginx :3", ["nginx", "-t"], process.cwd());
		let nginxpath = utils.shell_log().toString().match(/.* file (.*)nginx\.conf test/)[1];
		let conf = fs.readFileSync(nginxpath + "nginx.conf", 'utf-8');
		if (conf.indexOf('include enabled_sites/*') === -1) {
			conf = conf.replace(/http ?\{/igm, "http {\n\tinclude enabled_sites/*.conf;");
			fs.writeFileSync(nginxpath + "nginx.conf", conf);
			console.log(`   ${"updated".cyan}: nginx.conf`);
		}
		await utils.mkdir(nginxpath + "enabled_sites");
		let name = `${require(path.join(process.cwd(),"package.json")).name}.conf`;
		if (utils.canAccess(ProyPath(name))) {
			await utils.Copy(ProyPath(name), path.join(nginxpath, "enabled_sites", name));
			console.log(`   ${"copying".cyan}: ${name}`);
			await utils.shell("Restarting Nginx", ["nginx", "-s", "reload"], process.cwd());
		}
		await utils.mkdir(ProyPath("node_modules"));
		makeLink('koaton');
		makeLink('koaton-cli');
		await utils.shell("Installing bower dependencies", ["bower", "install"], process.cwd());
		await utils.shell("Installing npm dependencies", ["npm", "install", "--loglevel", "info"], process.cwd());
		return false;
	});
