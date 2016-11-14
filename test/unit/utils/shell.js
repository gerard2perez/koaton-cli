/*global describe, it*/
import * as co from 'co';
import * as assert from 'assert';
import * as utils from '../../../src/utils';

describe('shell', function() {
	it('compiles a file with args', function(done) {
		co(async function(){
			assert.equal(0, await utils.shell('getting path',['ls','-a']));
			assert.equal(false,!await utils.shell('getting path',['ls','-j'],'templates'));
		}).then(done,done).catch(done);
	});
});
