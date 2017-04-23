'use strict';

exports.default = {
	// Time in Seconds
	tokenTimeout: {
		dev: 60 * 1,
		prod: 60 * 5
	},
	keys: ['9184f115438655076a7675827bbfa1d98745217f'],
	model: 'user',
	username: 'username',
	password: 'password',
	strategies: {
		/* local: {
			package: 'passport-local',
			identifier: 'local',
			options: {
				session: true
			}
		}*/
	}
};
