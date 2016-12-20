/*global describe, it*/
import * as assert from 'assert';
import {adapters, template} from '../../../src/support/Adapters';

describe('adapters', function () {
	it('returns "mongoose", .mongoose', function () {
		assert.equal('mongoose', adapters.mongoose);
	});
	it('returns "27017", .mongoose.port', function () {
		assert.equal('27017', adapters.mongoose.port);
	});
	it('returns "mongoose", .mongoose.package', function () {
		assert.equal('mongoose', adapters.mongoose.package);
	});

	it('returns "mongoose", .mongo', function () {
		assert.equal('mongoose', adapters.mongo);
	});
	it('returns "couchdb", .couch', function () {
		assert.equal('couchdb', adapters.couch);
	});
	it('returns "mysql", .mariadb', function () {
		assert.equal('mysql', adapters.mariadb);
	});

	it('return mongoose as default adapter', function () {
		assert.equal(adapters.isOrDef(undefined).package, 'mongoose');
	});

	it('return mysql as adapter', function () {
		assert.equal(adapters.isOrDef('mariadb').package, 'mysql');
	});

	it('is "of" iterable', function () {
		assert.equal(!!adapters[Symbol.iterator], true);
	});



});
