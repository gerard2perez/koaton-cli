import * as assert from 'assert';
import EmberAppItem from '../../../src/support/EmberAppItem';

describe('EmberAppItem', function () {
	let App = new EmberAppItem();
	it('creates EmberApp Default config', function () {
		assert.equal(App.name, 'emberapp');
		assert.equal(App.mount, '/');
		assert.equal(App.directory, '/emberapp');
		assert.equal(App.access, 'public');
		assert.equal(App.adapter, 'localhost');
		assert.equal(App.subdomain, 'www');
		assert.equal(App.layout, 'main');
	});

	it('creates EmberApp with config', function () {
		App = new EmberAppItem('test', {mount: '/panel'});
		assert.equal(App.name, 'test');
		assert.equal(App.mount, '/panel');
		assert.equal(App.directory, '/emberapp');
		assert.equal(App.access, 'public');
		assert.equal(App.adapter, 'localhost');
		assert.equal(App.subdomain, 'www');
		assert.equal(App.layout, 'main');
	});

	it('is equal if name are the same', function () {
		let App2 = new EmberAppItem('test');

		assert.equal(App.equals(App2), true);
	});

	it('returns app\' name', function () {
		assert.equal(App.valueOf(), 'test');
	});
});
