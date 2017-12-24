import * as assert from 'assert';
import * as co from 'co';
import * as utils from '../../../src/utils';
import f from '../../support/console';
import * as os from 'os';

const platform = os.platform();
const ls = {win32: 'cd'};
describe('exec', function () {
	it('return current path', function (done) {
		co(async function () {
			f.init(false);
			let res = await utils.exec(ls[platform] || 'ls');
			f.init(true);
			assert.ok(res.stdout.indexOf('koaton-cli') > -1);
			assert.equal('', f.log());
			done();
		});
	});
	it('return error', function (done) {
		co(async function () {
			let res = await utils.exec('lsa -kl', null);
			assert.ok(res instanceof Error);
			done();
		});
	});
});
