const http = require('http');
function GET (hostname) {
	return new Promise(function (resolve, reject) {
		let [protocol, host] = hostname.split('//');
		let url = host.split('/');
		host = url[0];
		url = url.splice(1, host.length).join('/');
		let request = http.request({
			protocol: protocol,
			hostname: host,
			port: 80,
			path: `/${url}`,
			agent: false
		});
		request.on('response', (response) => {
			let result = '';
			response.on('data', (chunk) => {
				result += chunk.toString();
			});
			response.on('error', (err) => {
				reject(err);
			});
			response.on('end', () => {
				resolve(result);
			});
		});
		request.end();
	});
}

export default GET;
