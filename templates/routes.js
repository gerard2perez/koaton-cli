'use strict';

exports.default = (subdomains) => {
	let {www} = subdomains;
	www.get('/')
		.get('/login');
};
