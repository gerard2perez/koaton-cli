import * as path from 'upath';
import 'colors';
import * as fs from 'fs-extra';
import utils from '../utils';
import command from '../command';

let nginxpath;
async function getnginxpath() {
	if (nginxpath === undefined) {
		let log = await utils.exec("nginx -t");
		log = log.stdout || log.stderr;
		nginxpath = log.toString().match(/.* file (.*)nginx\.conf test/)[1];
	}
	return nginxpath;
}

export async function copyconf(name) {
	await utils.copy(ProyPath(name), path.join(await getnginxpath(), "enabled_sites", name));
	console.log(`   ${"copying".cyan}: ${name}`);
	try {
		await utils.shell("Restarting Nginx", ["nginx", "-s", "reload"], process.cwd());
	} catch (e) {
		console.log(e);
	}
}

export default (new command(__filename, 'helps bind the server to nginx'))
.Options([
		["-g", "--generate", "create a .conf file for the project"]
	])
	.Action(async function(options) {
		let conf = fs.readFileSync(await getnginxpath() + "nginx.conf", 'utf-8');
		if (conf.indexOf('include enabled_sites/*') === -1) {
			conf = conf.replace(/http ?\{/igm, "http {\n\tinclude enabled_sites/*.conf;");
			fs.writeFileSync(nginxpath + "nginx.conf", conf);
			console.log(`   ${"updated".cyan}: nginx.conf`);
			await utils.mkdir(nginxpath + "enabled_sites");
		}
		if (options.generate) {
			let server_template = await utils.read(TemplatePath('subdomain.conf'), 'utf-8');
			let nginx_conf = await utils.read(TemplatePath('server.conf'), 'utf-8');
			nginx_conf = utils.compile(nginx_conf, {
				hostname: scfg.hostname,
				port: scfg.port
			});
			const subdomains = require(`${process.cwd()}/config/server`).subdomains;
			for (const idx in subdomains) {
				nginx_conf += utils.compile(server_template, {
					subdomain: subdomains[idx],
					hostname: scfg.hostname,
					port: scfg.port
				});
			}
			utils.write(path.join(process.cwd(), `${require(path.join(process.cwd(),"package.json")).name}.conf`), nginx_conf);
		} else {
			await copyconf(`${scfg.name}.conf`);
		}

	});
