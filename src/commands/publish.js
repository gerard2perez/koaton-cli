import 'colors';
import utils from '../utils';
import command from '../command';

const versions = ["alpha", "alpha_minor", "alpha_major", "beta", "beta_minor", "beta_major", "major", "minor", "patch"];
const options = ["latest", "alpha", "beta"];

function validate(version) {
	return versions.indexOf(version);
}

function validateTag(version) {
	return options.indexOf(version);
}

export default (new command(__filename, "Take the actions needed to commit and publish a new version of your app."))
.Args("none")
	.Options([
		["-t", "--tag <tag>", `[${options.map((v)=>{return v.cyan}).join(" | ")}] Optional taganame to publish on npm`],
		["-v", "--semver <version>", `[${versions.map((v)=>{return v.cyan}).join(" | ")}] Select if you want to increse your pakage version`],
		["-m", "--message <message>", "This is the message that would be added to the commit"]
	])
	.Action(async function(options) {
		await utils.shell("Building assets for production", ["koaton", "build", "-p"], process.cwd());
		if (options.semver !== undefined && validate(options.semver)) {
			await utils.shell("Dumping version", ["koaton", "semver", options.semver], process.cwd());
		}
		options.message = options.message || Date.now().toString() + " uncommented.";
		await utils.shell("Adding changes", ["git", "add", "--all"], process.cwd());
		await utils.shell("Commiting changes", ["git", "commit", "-m", options.message], process.cwd());
		await utils.shell("Pushing changes", ["git", "push"], process.cwd());
		if (options.tag !== undefined && validateTag(options.tag)) {
			await utils.shell("Publishing to npm", ["npm", "publish", "--tag", options.tag], process.cwd());
		}
	});
