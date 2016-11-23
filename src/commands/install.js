import 'colors';
import utils from '../utils';
import command from '../command';
// import {copyconf} from './nginx';

export default (new command(__filename, "SetUps a recent clonned proyect. (root/Administrator permission needed to work with nginx)"))
.Args()
	.Options()
	.Action(async function() {
		// await copyconf(`${scfg.name}.conf`);
		await utils.shell("Installing bower dependencies", ["bower", "install"], process.cwd());
		await utils.shell("Installing npm dependencies", ["npm", "install", "--loglevel", "info"], process.cwd());
	});
