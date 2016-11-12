/*global describe, it*/
import * as assert from 'assert';
import ORMModel from '../../../src/support/ORMModel';
import MutableArray from '../../../src/support/MutableArray';
import BundleItem from '../../../src/support/BundleItem';

let testing = {
		database: {},
		bundles: []
	},
	calls = 0;

describe('MutableArray', function() {
	let database = new MutableArray(ORMModel, testing, 'database', function() {
		calls++;
	});
	let model1 = new ORMModel('casa', 'address street cp:number', [], []);
	it('Creates a Mutable array with the specified class', function() {
		assert.equal(database.mutable.name, 'ORMModel');
	});
	it('Add a new object', function() {
		database.add(model1);
		assert.equal(database.casa.equals(testing.database.casa), true);
	});
	it('returns if an item exits or not', function() {
		let model2 = new ORMModel('house', 'address street cp:number', [], []);
		assert.equal(database.has(model1), true, 'model1');
		assert.equal(database.has(model2), false, 'model2');
		assert.equal(database.has('casa'), true, 'model1 (string)');
		assert.equal(database.has('house'), false, 'model2 (string)');
	});
	it('wont add an object if already exits', function() {

		let model1 = new ORMModel('casa', 'address street cp:number', [], []);
		assert.equal(database.add(model1), database);
	});
	it('removes an item', function() {
		assert.equal(database.remove(undefined), database);
		assert.equal(database.remove(model1), database);
		assert.equal(database.casa, undefined);
		assert.equal(testing.database.casa, undefined);
	});
	it('is object iterable', function() {
		for (const model of database) {
			assert.equal(model.name, 'house');
		}
		assert.equal(calls, 2);
	});
	it('adds an element but calls the BaseClass', function() {
		assert.equal(database.has('casa'), false);
		database.add('casa', 'address street cp:number', [], []);
		assert.equal(database.has('casa'), true);
	});
	it('MutablArray with arrays', function() {
		let bundles = new MutableArray(BundleItem, testing, 'bundles', function(item, action) {
			assert.equal(["r", "a"].indexOf(action) > -1, true);
			assert.equal(["casa.js", "house.js"].indexOf(item.file) > -1, true);
		});
		bundles.add('casa.js', 'mochs.js');
		bundles.add('house.js', ['mocha.js', 'chai.js']);
		assert.equal(bundles['casa.js'] instanceof BundleItem, true);
		assert.equal(bundles['house.js'] instanceof BundleItem, true);
		assert.equal(bundles.remove('house.js'), bundles);
		assert.equal(testing.bundles.length,1);
	});
	it('toJSON', function() {
		assert.equal(JSON.stringify(database), JSON.stringify(testing.database));
	});
});
