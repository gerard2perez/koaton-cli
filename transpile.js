const Promise = require('bluebird');
const fs = require('graceful-fs');
const glob = require('glob');
const path = require('upath');
const babel = require("babel-core");

const transpilepaths = [
	// ["src/core/", "core"],
	["src/", "lib"]
];
const transform = Promise.promisify(babel.transformFile, {
	context: babel
});
const writeFile = Promise.promisify(fs.writeFile);
let converting = [];
const exporttov1 = function(transpile, file) {
	let targetroute = file.replace(transpile[0], "");
	targetroute = path.join(transpile[1], targetroute.replace(path.basename(targetroute), ""));
	try {
		fs.mkdirSync(targetroute);
	} catch (e) {
		e = null;
	} finally {
		converting.push(transform(file, {
			babelrc: false,
			plugins: [
				"babel-plugin-transform-koaton-es6-modules",
				"babel-plugin-transform-koa2-async-to-generator"
			]
		}).then((content) => {
			return writeFile(path.join(targetroute, path.basename(file)), content.code, {});
		}));
	}
}
Promise.all(converting).then(() => {
	console.log("All files converted");
});

let transpiler = () => {};
switch (process.argv[2]) {
	case "v1":
		transpiler = exporttov1; //.bind(null,transpile);
		break;
	default:
		break;
}

transpilepaths.forEach((transpile) => {
	transpile[0] = path.join(process.cwd(), transpile[0]);
	transpile[1] = path.join(process.cwd(), transpile[1]);
	glob.sync(transpile[0] + "**/*.js").forEach(transpiler.bind(null, transpile));
});
