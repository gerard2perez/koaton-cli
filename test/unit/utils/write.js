import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as utils from '../../../src/utils';
import f from '../../support/console';

describe('write', function () {
	it('returns null is error happend', function () {
		fs.mkdirsSync('./mkdir');
		f.init(false);
		let res = utils.write('./mkdir', 'hola mundo');
		f.init(true);
		assert.equal(null, res);
		fs.removeSync('./mkdir');
	});
});
