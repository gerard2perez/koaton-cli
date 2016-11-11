/*global describe, it*/
import * as assert from 'assert';
import DataTypes from '../../../src/support/DataTypes';

describe('DataTypes', function() {
	it('retutns "number", .number', function() {
		assert.equal("number", DataTypes.number);
	});
	it('retutns "number", .number.koaton', function() {
		assert.equal("number", DataTypes.number.koaton);
	});
	it('retutns "Number", .number.caminte', function() {
		assert.equal("Number", DataTypes.number.caminte);
	});
	it('retutns "number", .number.crud', function() {
		assert.equal("number", DataTypes.number.crud);
	});
	it('retutns "number", .number.ember', function() {
		assert.equal("number", DataTypes.number.ember);
	});
	it('retutns "number", .Number', function() {
		assert.equal("number", DataTypes.Number);
	});

	it('retutns "password", .password', function() {
		assert.equal("password", DataTypes.password);
	});
	it('retutns "password", .password.koaton', function() {
		assert.equal("password", DataTypes.password.koaton);
	});
	it('retutns "String", .password.caminte', function() {
		assert.equal("String", DataTypes.password.caminte);
	});
	it('retutns "password", .password.crud', function() {
		assert.equal("password", DataTypes.password.crud);
	});
	it('retutns "string", .password.ember', function() {
		assert.equal("string", DataTypes.password.ember);
	});
	it('retutns "password", .Password', function() {
		assert.equal("password", DataTypes.Password);
	});
});
