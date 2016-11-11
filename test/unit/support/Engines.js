/*global describe, it*/
import * as assert from 'assert';
import Engines from '../../../src/support/Engines';

describe('Engines', function() {
	it('returns "handlebars", .handlebars', function() {
		assert.equal("handlebars", Engines.handlebars);
	});

	it('return handlebars as default engine',function(){
		assert.equal(Engines.isOrDef(undefined),'handlebars');
	});

	it('return handlebars as engine',function(){
		assert.equal(Engines.isOrDef('handlebars'),'handlebars');
	});

	it('is "of" iterable',function(){
		assert.equal(!!Engines[Symbol.iterator],true);
	});


});
