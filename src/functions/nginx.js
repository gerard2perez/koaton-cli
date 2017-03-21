import exec from '../utils/exec';

let nginxpath;
async function getnginxpath () {
	if (nginxpath === undefined) {
		let log = await exec('nginx -t');
		log = log.stdout || log.stderr;
		if (log === undefined) {
			throw new Error('Err! are you sure nginx is running and well configured.'.red);
		}
		nginxpath = log.toString().match(/.* file (.*)nginx\.conf test/)[1];
	}
	return nginxpath;
}

export { getnginxpath };
