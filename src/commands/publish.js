import 'colors';
import utils from '../utils';
import command from '../command';

const versions = ["major", "minor", "patch"];
const tags = ["latest", "alpha", "beta"];

function contains(target,value){
	return target.indexOf(value)>-1;
}
export default (new command(__filename, "Take the actions needed to commit and publish a new version of your app."))
	.Options([
		["-t", "--tag <tag>", `[${tags.map((v)=>{return v.cyan}).join(" | ")}] Optional taganame to publish on npm`],
		["-v", "--semver <version>", `[${versions.map((v)=>{return v.cyan}).join(" | ")}] Select if you want to increse your pakage version`],
		["-m", "--message <message>", "This is the message that would be added to the commit"]
	])
	.Action(async function(options) {
		await utils.shell("Building assets for production", ["koaton", "build", "-p"]);
		if (contains(versions,options.semver)) {
			await utils.shell("Dumping version", ["koaton", "semver", options.semver]);
		}
		options.message = options.message || Date.now().toString() + " uncommented.";
		await utils.shell("Adding changes", ["git", "add", "--all"]);
		await utils.shell("Commiting changes", ["git", "commit", "-m", options.message]);
		await utils.shell("Pushing changes", ["git", "push"]);
		if (contains(tags,options.tag)) {
			await utils.shell("Publishing to npm", ["npm", "publish", "--tag", options.tag]);
		}
	});
