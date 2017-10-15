import exec from '../utils/exec';
import {join} from 'upath';
import { sync as glob } from 'glob';
import * as fs from 'fs-extra';
import copy from '../utils/copy';
import shell from '../utils/shell';
import mkdir from '../utils/mkdir';
import compile from '../utils/compile';
import write from '../utils/write';

let nginxpath;
export async function getnginxpath () {
	if (nginxpath === undefined) {
		let cmd = 'nginx -t';
		/* istanbul ignore next */
		if (process.env.TRAVIS) {
			return join(process.cwd(), '..', 'etc', '/');
		}
		let log = await exec(cmd);
		log = log.stdout || log.stderr || log.toString();
		if (log === undefined) {
			throw new Error('Err! are you sure nginx is running and well configured.'.red);
		}
		nginxpath = log.toString().match(/.* file (.*)nginx\.conf test/)[1];
	}
	return nginxpath;
}
export async function copyconf (name) {
	await copy(ProyPath(name), join(await getnginxpath(), 'sites-enabled', name));
	console.log(`   ${'copying'.cyan}: ${name}`);
	await shell('Restarting Nginx', ['nginx', '-s', 'reload'], process.cwd());
}
export async function buildNginx () {
	let nginxpath = await getnginxpath();
	let conf = fs.readFileSync(nginxpath + 'nginx.conf', 'utf-8');
	if (conf.indexOf('include sites-enabled/*') === -1) {
		conf = conf.replace(/http ?\{/igm, 'http {\n\tinclude ./sites-enabled/*.conf;');
		if (!fs.existsSync(join(nginxpath, 'sites-enabled'))) {
			fs.mkdirSync(join(nginxpath, 'sites-enabled'));
		}
		fs.writeFileSync(nginxpath + 'nginx.conf', conf);
		console.log(`   ${'updated'.cyan}: nginx.conf`);
	}
	let serverTemplate = fs.readFileSync(TemplatePath('subdomain.conf'), 'utf-8');
	let nginxConf = fs.readFileSync(TemplatePath('server.conf'), 'utf-8');

	let security = '';
	let redirectSSL = '';
	if (configuration.server.https && configuration.server.https.key) {
		security = `listen 443 ssl;\n\tssl_certificate ${configuration.server.https.cert};\n\tssl_certificate_key ${configuration.server.https.key};\n\tssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n\tssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';\n\tssl_prefer_server_ciphers on;`;
		if (configuration.server.https.dhparam) {
			security += `\n\tssl_dhparam ${configuration.server.https.dhparam};\n`;
		}
		redirectSSL = `server {\n\t${security}\tserver_name ${configuration.server.host};\n\treturn 301 https://www.bitsun.com.mx$request_uri;\n}\n`;
	}
	nginxConf = redirectSSL + compile(nginxConf, {
		server_name: `${configuration.server.host}${security ? ' www.' + configuration.server.host : ''}`,
		hostname: configuration.server.host,
		port: configuration.server.port,
		protocol: security ? 'https' : 'http'
	});
	let childsubdomains = glob('koaton_modules/**/config/server.js').map((c) => {
		return require(ProyPath(c)).default.subdomains;
	});
	childsubdomains.push(configuration.server.subdomains);
	let allsubdomains = [].concat.apply([], childsubdomains).filter((f, i, a) => a.indexOf(f) === i);
	for (const idx in allsubdomains) {
		nginxConf += compile(serverTemplate, {
			subdomain: allsubdomains[idx],
			hostname: configuration.server.host,
			port: configuration.server.port,
			listen: security || 'listen 80',
			client_max_body_size: (configuration.server.client_max_body_size || '1M'),
			protocol: security ? 'https' : 'http'
		});
		if (security && allsubdomains[idx] !== 'www') {
			nginxConf += `server {\n\tlisten 80;\n\tserver_name ${allsubdomains[idx]}.${configuration.server.host};\n\treturn 301 https://$host$request_uri;\n}\n`;
		}
	}
	let res = write(ProyPath(`${configuration.server.name}.conf`), nginxConf);
	console.log(`   ${res !== null ? __ok.green : __nok.red} Built ${configuration.server.name}.conf`);
}
