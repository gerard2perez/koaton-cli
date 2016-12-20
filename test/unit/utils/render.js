/*global describe, it*/
import * as co from 'co';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as utils from '../../../src/utils';
import f from '../../support/console';

const template = 'Say {{something}}!';

describe('render', function () {
	it('compiles a file with args', function () {
		utils.rmdir('./render.txt');
		utils.rmdir('./compiled.txt');
		fs.outputFileSync('./render.txt', template);
		f.init(false);
		let res = utils.render('./render.txt', './compiled.txt', {
			something: 'Hello'
		});
		f.init(true);
		assert.equal('Say Hello!', res.compiled);
		assert.equal(`   ${'create'.cyan}: ./${'compiled.txt'.green}`, f.log());
		utils.rmdir('./render.txt');
		utils.rmdir('./compiled.txt');
	});
});
