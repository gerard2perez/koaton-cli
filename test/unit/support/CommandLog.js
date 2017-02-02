import * as assert from 'assert';
import CommandLog from '../../../src/support/CommandLog';

describe('CommandLog', function () {
	let liveupdate = {changelog: []};
	let list = new CommandLog(liveupdate, 'changelog');

	it('adds a command', function () {
		list.add('add me');
		assert.equal(liveupdate.changelog.length, 1);
	});

	it('wont add an existing item', function () {
		list.add('add me');
		assert.equal(liveupdate.changelog.length, 1);
	});

	it('triggers and update when adding a value', function () {
		let added = 0;
		list = new CommandLog(liveupdate, 'changelog', () => {
			added++;
		});
		list.add('add me');
		list.add('add another');
		assert.equal(liveupdate.changelog.length, 2);
		assert.equal(added, 1);
	});
});
