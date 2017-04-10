import exec from '../utils/exec';

let nginxpath;
async function getnginxpath () {
	if (nginxpath === undefined) {
		let cmd = 'nginx -t';
		/* istanbul ignore next */
		if (process.env.TRAVIS) {
			cmd += '-c `pwd`/etc/nginx.conf -p `pwd`/etc/';
		}
		let log = await exec(cmd);
		log = log.stdout || log.stderr;
		if (log === undefined) {
			throw new Error('Err! are you sure nginx is running and well configured.'.red);
		}
		nginxpath = log.toString().match(/.* file (.*)nginx\.conf test/)[1];
	}
	return nginxpath;
}

export { getnginxpath };
