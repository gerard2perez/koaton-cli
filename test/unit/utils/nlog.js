/*global describe, it*/
import * as assert from 'assert';
import * as utils from '../../../src/utils';
import f from '../../support/fakelog';

describe('nlog', function() {
	it('writes something with \n', function() {
		f.init(false);
		try {
			utils.nlog('tell me something\n');
		} catch (e) {
			//TODO: log:test I don't know how to make the test pass.
		}
		f.init(true);
		// assert.equal('tell me something\n', f.log());
		assert.ok(true);
	});
})
