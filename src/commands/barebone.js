/*eslint no-unused-vars:0*/
import * as path from 'upath';
import 'colors';
import fs from 'graceful-fs';
import utils from '../utils';
import command from '../command';

export default (new command(__filename, 'dummy command'))
.Args("none")
	.Options([
		["-f", "--force", "Overrides the existing directory."],
		["-n", "--skip-npm", "Omits npm install"],
		["-b", "--skip-bower", "Omits bower install"]
	])
	.Action(async function(none, options) {
		console.log(koaton_app, ember_app, ember_app_mount);
		let x = await utils.exec("tput cols", ["cols"], {
			shell: false
		});
		console.log(parseInt(x.stdout, 10));
	});
