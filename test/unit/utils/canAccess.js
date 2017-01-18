/*global describe, it*/
import * as assert from 'assert';
import * as utils from '../../../src/utils';

for (const t of utils) {}
describe('canAccess', function () {
	it('returns true', function () {
		assert.ok(utils.canAccess('./test'));
	});
	it('returns false', function () {
		assert.ok(!utils.canAccess('./tests'));
	});
});
