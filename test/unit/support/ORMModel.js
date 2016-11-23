/*global describe, it*/
import * as assert from 'assert';
import ORMModel from '../../../src/support/ORMModel';

describe('ORMModel', function() {
	let cities = new ORMModel('city', 'name');
	let address = new ORMModel('aDdress', 'street number:number cp:number', {
		"city": 'belongsTo cities cityId'
	});
	let users = new ORMModel('UseRs', 'name age:number email:email', {
		"addresses": "hasMany address",
		"cities": "hasMany city"
	}, {
		city: cities,
		address: address
	});

	it("throw an exception when missing args", function() {
		try {
			let nomodel = new ORMModel('admin');
		} catch (e) {
			assert.ok(e);
		}
	});
	it('Shoud have a lowercase singular _modelname field', function() {
		assert.equal(users._modelname, 'user');
		assert.equal(users._modelname.capital, 'User');
	});
	it('print a caminte model definition', function() {
		let model = `"use strict";
module.exports = function(schema,relation) {
	return {
		model: {
			name:{type:schema.String},
			age:{type:schema.Number},
			email:{type:schema.Email}
		},
		extra: {},
		relations: {
			"addresses":relation.hasMany("address.addressesId"),
			"cities":relation.hasMany("city.citiesId")
		}
	};
};`;
		assert.equal(users.toCaminte(), model);
	});
	it('print a ember model definition', function() {
		let model = `import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
export default Model.extend({
	name:attr('string'),
	age:attr('number'),
	email:attr('string'),
	addresses:hasMany("address"),
	cities:hasMany("city")
});`;
		assert.equal(users.toEmberModel(), model);
	});
	it('print a ember-cli-crudtable model definition', function() {
		let model = `import Ember from 'ember';
import crud from 'ember-cli-crudtable/mixins/crud-controller';
export default Ember.Controller.extend(crud('user'), {
	actions: {
		_addresses(deferred){this.store.findAll('address').then(deferred.resolve,deferred.reject);},
		_cities(deferred){this.store.findAll('city').then(deferred.resolve,deferred.reject);}
	},
	fieldDefinition: {
		"name":{"Type":"text"},
		"age":{"Type":"number"},
		"email":{"PlaceHolder":"account@your.domain","Type":"email"},
		addresses:{Type:"hasMany",Display:"street",Source:"_addresses"},
		cities:{Type:"hasMany",Display:"name",Source:"_cities"}
	}\n});`;
		assert.equal(users.toCRUDTable(), model);
	});

	it('Gets the .koaton representation', function() {
		assert.equal(JSON.stringify(users.toMeta()), '{"model":"name:string age:number email:email","relations":[{"addresses":"hasMany address addressesId"},{"cities":"hasMany city citiesId"}]}')
	});
});
