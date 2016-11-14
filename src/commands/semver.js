/*eslint no-fallthrough:0*/
import 'colors';
import * as fs from 'graceful-fs';
import utils from '../utils';
import command from '../command';

let parseVersion = function parseVersion(vstr) {
	let [version, tmp] = vstr.split("-");
	let [channel, subversion] = (tmp || ".").split('.');
	version = version.split('.').map(nm => parseInt(nm, 10));
	return [{
		major: version[0],
		minor: version[1],
		patch: version[2]
	}, channel, parseInt(subversion || 0, 10)];
}
export default (new command(__filename, "mode can be major, minor, patch"))
.Args("mode")
	.Action(async function(mode) {
		if (!mode) {
			console.log('   The command cannot be run this way.\n\tkoaton semver -h\n   to see help.'.yellow);
			return 0;
		}
		let packageJSON = JSON.parse(fs.readFileSync("package.json", 'utf-8'));
		let [version, channel, subversion] = parseVersion(packageJSON.version);
		let n = version[mode];
		switch (mode) {
			case "major":
				version.minor=0;
			case "minor":
				version.patch=0
			case "patch":
				// if (!channel) {
				version[mode] = ++n;
				// subversion = 0;
				// } else {
				// channel = "";
				// subversion = 0;
				// }
				break;
				// case "alpha":
				// case "beta":
				// 	if (subversion === 0 && !channel) {
				// 		version.major++;
				// 		version.minor = 0;
				// 		version.patch = 0;
				// 	}
				// 	if (channel !== mode) {
				// 		subversion = 0;
				// 	}
				// 	channel = mode;
				// 	subversion++;
				// 	break;
			default:
				if (mode.indexOf(".") > -1) {
					[version, channel, subversion] = parseVersion(mode);
				}
		}
		let final = `${version.major}.${version.minor}.${version.patch}` + (channel ? `-${channel}.${subversion}` : '');
		packageJSON.version = final;
		utils.write("package.json", JSON.stringify(packageJSON, null, 2), -1);
		return 0;
	});
