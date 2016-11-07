import MutableArray from '../../src/support/MutableArray';
import Model from '../../src/support/ORMModel';
import BundleItem from '../../src/support/BundleItem';

describe('does', function() {
	let testing = {
		database: {},
		bundles:{}
	};
	it('Construction',function(){

	});
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
	it('MutableArray Array',function(){
		let bundles = new MutableArray(BundleItem,testing,'bundles', function(...args) {
			// console.log(JSON.stringify(testing, 4, 4));
		});
		bundles.add('casa.js','mochs.js');
	});
});
