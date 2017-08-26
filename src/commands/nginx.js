import 'colors';
import Command from 'cmd-line/lib/Command';
import { copyconf, buildNginx } from '../functions/nginx';
export default (new Command(__filename, 'helps bind the server to nginx'))
	.Options([
		['-i', '--install', 'creates and install the .conf in your nginx path.']
	])
	.Action(async function (options) {
		await buildNginx();
		if (options.install) {
			await copyconf(`${scfg.name}.conf`);
		}
	});
