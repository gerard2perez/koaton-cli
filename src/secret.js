import { randomBytes } from 'crypto';

export default function (size) {
	return new Promise(function (resolve, reject) {
		randomBytes(size, (err, buf) => {
			if (err) {
				reject(err);
			} else {
				resolve(buf);
			}
		});
	});
}
