'use strict';

exports.default = {
	name: 'koaton',
	database: {
		relationsMode: 'ids',
		connection: 'mongo'
	},
	pagination: {
		limit: 50,
		serchTerm: 'search'
	},
	subdomains: [
		'www',
		'origin'
	],
	host: {
		dev: 'localhost',
		prod: '127.0.0.1'
	},
	env: process.env.NODE_ENV || 'development',
	port: process.env.port || 62626,
	bodyParser: {},
	error: {
		view: 'error/error',
		layout: 'layouts/error',
		custom: {
			401: 'error/401',
			403: 'error/403',
			404: 'error/404'
		}
	},
	localization: {
		queryKey: 'locale',
		directory: './locales',
		locales: ['en'],
		modes: [
			'query', //  optional detect querystring - `/?locale=en-US`
			'subdomain', //  optional detect subdomain   - `zh-CN.koajs.com`
			'cookie', //  optional detect cookie      - `Cookie: locale=zh-TW`
			'header', //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
			'url', //  optional detect url         - `/en`
			'tld' //  optional detect tld(the last domain) - `koajs.cn`
		]
	}
};
