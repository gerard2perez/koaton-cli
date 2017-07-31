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
		let ssl = '';
		if (configuration.server.https) {
			ssl = `\n\tlisten 443 ssl;\n\tssl on;\n\tssl_certificate ${configuration.server.https.cert};\n\tssl_certificate_key ${configuration.server.https.key};\n\tssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n\tssl_prefer_server_ciphers on;`;
			if (configuration.server.https.dhparam) {
				ssl += `\n\tssl_dhparam ${configuration.server.https.dhparam};`;
			}
		}
		let serverTemplate = await utils.read(TemplatePath('subdomain.conf'), 'utf-8');
		let nginxConf = await utils.read(TemplatePath('server.conf'), 'utf-8');
		nginxConf = utils.compile(nginxConf, {
			hostname: scfg.host,
			port: scfg.port,
			protocol: configuration.server.https ? 'https' : 'http'
		});
		const subdomains = configuration.server.subdomains;
		for (const idx in subdomains) {
			nginxConf += utils.compile(serverTemplate, {
				ssl: ssl,
				client_max_body_size: configuration.server.client_max_body_size || '1m',
				subdomain: subdomains[idx],
				hostname: scfg.host,
				port: scfg.port,
				protocol: configuration.server.https ? 'https' : 'http'
			});
		}
		utils.write(path.join(process.cwd(), `${require(path.join(process.cwd(), 'package.json')).name}.conf`), nginxConf);
		if (options.install) {
			await copyconf(`${scfg.name}.conf`);
		}
	});
