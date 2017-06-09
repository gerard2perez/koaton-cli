import * as path from 'upath';
import 'colors';
import * as fs from 'fs-extra';
import utils from '../utils';
import {getnginxpath} from '../functions/nginx';
import Command from 'cmd-line/lib/Command';

export async function copyconf (name) {
	await utils.copy(ProyPath(name), path.join(await getnginxpath(), 'enabled_sites', name));
	console.log(`   ${'copying'.cyan}: ${name}`);
	await utils.shell('Restarting Nginx', ['nginx', '-s', 'reload'], process.cwd());
}

export default (new Command(__filename, 'helps bind the server to nginx'))
	.Options([
		['-i', '--install', 'creates and install the .conf in your nginx path.']
	])
	.Action(async function (options) {
		let nginxpath = await getnginxpath();
		let conf = fs.readFileSync(`${nginxpath}nginx.conf`, 'utf-8');
		if (conf.indexOf('include enabled_sites/*') === -1) {
			conf = conf.replace(/http ?\{/igm, 'http {\n\tinclude enabled_sites/*.conf;');
			fs.writeFileSync(nginxpath + 'nginx.conf', conf);
			console.log(`   ${'updated'.cyan}: nginx.conf`);
			await utils.mkdir(nginxpath + 'enabled_sites');
		}
		let serverTemplate = await utils.read(TemplatePath('subdomain.conf'), 'utf-8');
		let nginxConf = await utils.read(TemplatePath('server.conf'), 'utf-8');
		nginxConf = utils.compile(nginxConf, {
			hostname: scfg.host,
			port: scfg.port
		});
		const subdomains = require(`${process.cwd()}/config/server`).subdomains;
		for (const idx in subdomains) {
			nginxConf += utils.compile(serverTemplate, {
				client_max_body_size: configuration.server.client_max_body_size || '1MB',
				subdomain: subdomains[idx],
				hostname: scfg.host,
				port: scfg.port
			});
		}
		utils.write(path.join(process.cwd(), `${require(path.join(process.cwd(), 'package.json')).name}.conf`), nginxConf);
		if (options.install) {
			await copyconf(`${scfg.name}.conf`);
		}
	});
