import * as assert from 'assert';
import * as utils from '../../../src/utils';

describe('canAccess', function () {
	it('returns true', function () {
		assert.ok(utils.canAccess('./test'));
	});
	it('returns false', function () {
		assert.ok(!utils.canAccess('./tests'));
	});
});
