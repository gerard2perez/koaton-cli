/*global describe, it*/
import * as assert from 'assert';
import DataTypes from '../../../src/support/DataTypes';

describe('DataTypes', function() {
	it('returns "number", .number', function() {
		assert.equal("number", DataTypes.number);
	});
	it('returns "number", .number.koaton', function() {
		assert.equal("number", DataTypes.number.koaton);
	});
	it('returns "Number", .number.caminte', function() {
		assert.equal("Number", DataTypes.number.caminte);
	});
	it('returns "number", .number.crud', function() {
		assert.equal("number", DataTypes.number.crud);
	});
	it('returns "number", .number.ember', function() {
		assert.equal("number", DataTypes.number.ember);
	});
	it('returns "number", .Number', function() {
		assert.equal("number", DataTypes.Number);
	});

	it('returns "password", .password', function() {
		assert.equal("password", DataTypes.password);
	});
	it('returns "password", .password.koaton', function() {
		assert.equal("password", DataTypes.password.koaton);
	});
	it('returns "String", .password.caminte', function() {
		assert.equal("String", DataTypes.password.caminte);
	});
	it('returns "password", .password.crud', function() {
		assert.equal("password", DataTypes.password.crud);
	});
	it('returns "string", .password.ember', function() {
		assert.equal("string", DataTypes.password.ember);
	});
	it('returns "password", .Password', function() {
		assert.equal("password", DataTypes.Password);
	});
	it('is "of" iterable',function(){
		assert.equal(!!DataTypes[Symbol.iterator],true);
	})

});
