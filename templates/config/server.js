'use strict';

exports.default = {
	name: '{{name}}',
	client_max_body_size: '1M',
	bodyParser: {
		formLimit: '1mb'
	},
	https: {
		dev: {
			key: undefined,
			cert: undefined
		},
		prod: {
			key: undefined,
			cert: undefined
		}
	},
	database: {
		relationsMode: 'ids',
		connection: 'mongo'
	},
	pagination: {
		limit: 50,
		serchTerm: 'search'
	},
	subdomains: [
		'www'
	],
	host: {
		dev: 'localhost',
		prod: '127.0.0.1'
	},
	env: process.env.NODE_ENV || 'development',
	port: process.env.port || 62626,
	bodyParser: {},
	error: {
		layout: 'error.handlebars',
		data: {
			support_email: 'support@{{name}}.com',
			description: 'Oops! - looks like something went completely wrong.'
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
