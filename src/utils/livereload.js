import * as livereload from 'gulp-refresh';
import * as fs from 'fs';
import * as detect from 'detect-port';

let initialized = false;
let options = {
	port: 65000,
	quiet: true
};
/* istanbul ignore next */
if (configuration.server.https && configuration.server.https.key && configuration.server.https.cert) {
	options.key = fs.readFileSync(configuration.server.https.key);
	options.cert = fs.readFileSync(configuration.server.https.cert);
}

module.exports = {
	get livereload () {
		if (!initialized) {
			initialized = true;
			(async () => {
				options.port = await detect(options.port);
				livereload.listen(options);
			})();
		}
		return livereload;
	},
	get livePort () {
		return options.port;
	},
	liveReloadHost () {
		return `//${scfg.hostname}:${options.port}/livereload.js?snipver=1`;
	}
};
