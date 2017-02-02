/*global describe, it*/
import * as assert from 'assert';
import * as co from 'co';
import * as utils from '../../../src/utils';
import f from '../../support/fakelog';

describe('challenge', function () {
	it('returns true', function (done) {
		co(async function () {
			f.init();
			let res = await utils.challenge('./test', 'wanna do something', true);
			f.init(true);
			assert.ok(res);
			done();
		});
	});
	it('returns true', function (done) {
		this.timeout = 10000;
		co(async function () {
			f.init();
			setTimeout(() => {
				f.init(true);
				assert.equal(f.log(), 'wanna do something [y/n]: ');
				done(null, 3);
			}, 5);
			let res = await utils.challenge('./test', 'wanna do something', false);
			assert.ok(res);
		});
	});
});
