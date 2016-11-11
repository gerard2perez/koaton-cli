/*global describe, it*/
import * as assert from 'assert';
import {Adapters,Template} from '../../../src/support/Adapters';

describe('Adapters', function() {
	it('returns "mongoose", .mongoose', function() {
		assert.equal("mongoose", Adapters.mongoose);
	});
	it('returns "27017", .mongoose.port', function() {
		assert.equal("27017", Adapters.mongoose.port);
	});
	it('returns "mongoose", .mongoose.package', function() {
		assert.equal("mongoose", Adapters.mongoose.package);
	});

	it('returns "mongoose", .mongo', function() {
		assert.equal("mongoose", Adapters.mongo);
	});
	it('returns "couchdb", .couch', function() {
		assert.equal("couchdb", Adapters.couch);
	});
	it('returns "mysql", .mariadb', function() {
		assert.equal("mysql", Adapters.mariadb);
	});

	it('return mongoose as default adapter',function(){
		assert.equal(Adapters.isOrDef(undefined).package,'mongoose');
	});

	it('return mysql as adapter',function(){
		assert.equal(Adapters.isOrDef('mariadb').package,'mysql');
	});

	it('is "of" iterable',function(){
		assert.equal(!!Adapters[Symbol.iterator],true);
	});



});
