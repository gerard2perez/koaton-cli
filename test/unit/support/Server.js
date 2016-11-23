/*global describe, it, before, after*/
import * as assert from 'assert';
import * as fs from 'fs-extra';
import Server from '../../../src/support/Server';
import ORMModel from '../../../src/support/ORMModel';

let user = `"use strict";
module.exports = function(schema,relation) {
	return {
	"model": {
		"username": { type:schema.String },
		"password": { type:schema.Password },
		"name": { type:schema.String },
		"middlename": { type:schema.String },
		"lastname": { type:schema.String },
		"gender": { type:schema.String },
		"birthday": { type:schema.Date },
		"license": { type:schema.String }
	},
	"extra": {
		'koaton-toolkit':{
			fields:{
				password:{
					List:false
				}
			}
		}
	},
	"relations": {}
};
};`;

let server;

describe('Server', function() {

	before(function() {
		fs.emptyDirSync('./serverconf');
		fs.mkdirsSync('./serverconf/config');
		fs.outputFileSync('./serverconf/package.json', fs.readFileSync(TemplatePath('package.json'), 'utf-8'));
		fs.outputFileSync('./serverconf/config/ember.js', `"use strict";\nmodule.exports={};`);
		fs.outputFileSync('./serverconf/models/user.js', user);
		fs.outputFileSync('./serverconf/config/server.js', fs.readFileSync(TemplatePath('config/server.js'), 'utf-8').replace("{{key}}", '"5as4dsa8d"'));
		process.chdir('./serverconf');
		server = new Server();
	});
	after(function(){
		process.chdir("..");
		fs.removeSync('./serverconf');
	});
	it('creates a new .koaton file', function() {
		assert.ok(!fs.accessSync('.koaton'));
	});
	it('add a new model', function() {
		server.database.add(new ORMModel('city', 'name'));
	});
	it('reads all project properties (development)', function() {
		server.env = "development";
		server.port = 62626;
		assert.equal('koaton_app', server.name);
		assert.equal(true, server.dev);
		assert.equal('localhost', server.host);
		assert.equal('1.0.0', server.version);
		assert.equal('localhost', server.hostname);
		assert.equal(1200, server.token_timeout);
	});
	it('get the rigth hostname', function() {
		server.localserver.host.dev = '125.124.123.122';
		assert.equal('125.124.123.122', server.hostname);

		server.localserver.host.dev = 'www.koaton.net';
		assert.equal('www.koaton.net', server.hostname);

		server.localserver.host.dev = 'koaton.net';
		assert.equal('www.koaton.net', server.hostname);
	});
	it('reads all project properties (production)', function() {
		server.env = "production";
		assert.equal(false, server.dev);
		assert.equal('127.0.0.1', server.host);
		assert.equal('127.0.0.1', server.hostname);
		assert.equal(300, server.token_timeout);
	});

	it('Add a new bundle', function() {
		server.bundles.add('hola.css', ['a.css', 'b.css']);
		server = new Server();
		assert.ok(server.bundles['hola.css']);
	});

	it('shorcuts', function() {
		assert.ok(server.database.models.user);
		assert.ok(server.database.relations);
	});

});
