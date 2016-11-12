/*global describe, it*/
import * as assert from 'assert';
import * as fs from 'fs-extra';
import ORMModel from '../../../src/support/ORMModel';
import MutableArray from '../../../src/support/MutableArray';

let testing = {
	database: {},
	bundles: {}
};
let calls=0;
describe('MutableArray', function() {
	it('MutableArray Object', function() {
		let database = new MutableArray(ORMModel, testing, 'database', function(...args) {
			// console.log(JSON.stringify(this, 4, 4));
		});
		database.toJSON = function() {
			let result = {
				models: {},
				relations: []
			};
			for (const model of this.target) {
				result.models[model._modelname] = model.toMeta().model
				result.relations.concat(model.toMeta().relations);
			}
			return result;
		};
		database.add(new Model('casa', 'address street cp:number', [], []));
	});
	it('MutableArray Array', function() {
		let bundles = new MutableArray(BundleItem, testing, 'bundles', function(...args) {
			// console.log(JSON.stringify(testing, 4, 4));
		});
		bundles.add('casa.js', 'mochs.js');
	});
});
