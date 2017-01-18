/*global describe, it, before, after*/
import * as assert from 'assert';
import * as fs from 'fs-extra';
import Server from '../../../src/support/Server';
import ORMModel from '../../../src/support/ORMModel';

let user = `"use strict";
exports.default = function(schema,relation) {
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

describe('Server', function () {
	before(function () {
		fs.emptyDirSync('./serverconf');
		fs.mkdirsSync('./serverconf/config');
		fs.outputFileSync('./serverconf/package.json', fs.readFileSync(TemplatePath('package.json'), 'utf-8'));
		fs.outputFileSync('./serverconf/config/ember.js', "'use strict';\nexports.default={};");
		fs.outputFileSync('./serverconf/models/user.js', user);
		fs.outputFileSync('./serverconf/config/server.js', fs.readFileSync(TemplatePath('config/server.js'), 'utf-8').replace('{{key}}', '"5as4dsa8d"'));
		process.chdir('./serverconf');
		server = new Server();
	});
	after(function () {
		process.chdir('..');
		fs.removeSync('./serverconf');
	});
	it('creates a new .koaton file', function () {
		assert.ok(!fs.accessSync('.koaton'));
	});
	it('add a new model', function () {
		server.database.add(new ORMModel('city', 'name'));
	});
	it('Add a new bundle', function () {
		server.bundles.add('hola.css', ['a.css', 'b.css']);
		server = new Server();
		assert.ok(server.bundles['hola.css']);
	});

	it('shorcuts', function () {
		assert.ok(server.database.models.user);
		assert.ok(server.database.relations);
	});
});
