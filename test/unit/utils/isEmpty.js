/*global describe, it*/
import * as assert from 'assert';
import * as utils from '../../../src/utils';

describe('isEmpty', function () {
	it('source is empty', function () {
		assert.ok(utils.isEmpty('./.babelrc'));
	});

	it('source is not empty', function () {
		assert.ok(!utils.isEmpty('./templates'));
	});
});
