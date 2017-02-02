import * as assert from 'assert';
import * as co from 'co';
import * as utils from '../../../src/utils';

describe('mkdir', function () {
	it('creates dir structure', function (done) {
		co(async function () {
			let res = await utils.mkdir('./mkdir/test/path');
			assert.equal(res, './mkdir/test/path');
		}).then(done, done).catch(done);
	});
});
