import 'colors';
import Command from 'cmd-line/lib/Command';
import render from '../utils/render';
import shell from '../utils/shell';

export default (new Command(
	__filename,
	'Generates a local certificate to use https in your local machine'))
	// .Args('common_name')
	.Options([
		['--c', '--c <C> MX', '2 word codes to describe the country (Default: MX)', 'MX'],
		['--st', '--st <ST>', '2 word codes to describe the estate (Default: GN)'],
		['--l', '--l <L>', '3 word code to describe the locality (Default: IRA)'],
		['--o', '--o', 'Organization (Default: koaton)'],
		['--ou', '--ou', 'Organization Unit (Default: DVL)'],
		['--cn', '--cn', 'Common Name (Default: [your www localhost])'],
		['--email', '--email <email>', "Database name for the connection default is ''. Use this with -g"]
	])
	.Action(async function (options) {
		let c = options.c || 'MX';
		let st = options.st || 'GN';
		let l = options.l || 'IRA';
		let o = options.o || 'Koaton';
		let ou = options.ou || 'DVL';
		let root_website = options.cn || `www.${configuration.server.host}`;
		let email = options.email;
		let alt_names_dns = configuration.server.subdomains.map(sub => {
			return `DNS:${sub}.${configuration.server.host}`;
		}).join(',')
		render(TemplatePath('openssl.cnf'), ProyPath('openssl.cnf'), {
			root_website,
			alt_names_dns,
			email,
			c,
			st,
			l,
			o,
			ou
		});
		await shell('Generating key', ['openssl', 'genrsa', '-out', `${configuration.server.host}.key`, 2048]);
		await shell('Generating certificate', ['openssl', 'req', '-new', '-sha256', '-x509', '-key', `${configuration.server.host}.key`, '-config', 'openssl.cnf', '-out', `${configuration.server.host}.crt`]);
		return 0;
	});
