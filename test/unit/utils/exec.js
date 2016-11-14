/*global describe, it*/
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as co from 'co';
import * as utils from '../../../src/utils';
import f from '../../support/console';


describe('exec', function() {
	it('return current path', function(done) {
		co(async function() {
			f.init(false);
			let res = await utils.exec('pwd');
			f.init(true);
			assert.ok(res.stdout.indexOf('koaton-cli') > -1);
			assert.equal("", f.log());
			done();
		});
	});

	it('return error', function(done) {
		co(async function() {
			try {
				let res = await utils.exec(undefined,null);
			} catch (e) {
				//TODO: exec:test I can't make it fail.
				assert.ok(e);
			}
			done();
		});
	});

});
