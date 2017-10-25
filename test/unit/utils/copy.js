import * as assert from 'assert';
import * as co from 'co';
import * as utils from '../../../src/utils';
import f from '../../support/console';

describe('copy', function () {
	it('copies no console output', function (done) {
		utils.rmdir('./koaton_c');
		co(async function () {
			f.init(false);
			await utils.copy('./koaton', './koaton_c', utils.writemodes.void);
			f.init(true);
			assert.equal('', f.log());
			assert.ok(utils.canAccess('./koaton_c'));
			utils.rmdir('./koaton_c');
		}).then(done, done).catch(done);
	});
	it('copies console output create', function (done) {
		utils.rmdir('./koaton.png');
		this.timeout(10000);
		co(async function () {
			f.init();
			let res = await utils.copy('./templates/public/img/koaton.png', './koaton.png', utils.writemodes.create);
			f.init(true);
			assert.equal(res, 'koaton.png');
			assert.ok(f.log().indexOf('koaton.png') > -1);

			f.init();
			await utils.copy('./templates/public/img/koaton.png', './koaton.png', utils.writemodes.update);
			f.init(true);
			assert.ok(utils.canAccess('./koaton.png'));
			utils.rmdir('./koaton.png');
		}).then(done, done).catch(done);
	});

	it('throws and error file not found', function (done) {
		this.timeout(10000);
		co(async function () {
			try {
				await utils.copy('./templates/public/img/koaton3.png', './koaton.png', utils.writemodes.create);
				assert.ok(true);
			} catch (err) {
				assert.ok(err.stack);
			}
		}).then(done, done).catch(done);
	});
});
