/*global describe, it */
import MutableArray from '../../src/support/MutableArray';
import Model from '../../src/support/ORMModel';

describe('Unit Testing', function() {
	let testing = {
		database: {},
		bundles:{}
	};
	it('MutableArray Object', function() {
		let database = new MutableArray(Model, testing, 'database', function(...args) {
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
});
