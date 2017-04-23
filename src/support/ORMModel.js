import datatypes from './DataTypes';
import compile from '../utils/compile';
import inflector from './inflector';

const compileCaminte = compile.bind(null, "'use strict';\nexports.default = function(schema,relation) {\n\treturn {\n\t\tmodel: {\n\t\t\t{{model}}\n\t\t},\n\t\textra: {},\n\t\trelations: {\n\t\t\t{{relations}}\n\t\t}\n\t};\n};");
const compileEmber = compile.bind(null, "import Model from 'ember-data/model';\nimport attr from 'ember-data/attr';\nimport { hasMany, belongsTo } from 'ember-data/relationships';\nexport default Model.extend({\n\t{{definition}}\n});");
const compileCRUDTable = compile.bind(null, "import Ember from 'ember';\nimport crud from 'ember-cli-crudtable/mixins/crud-controller';\nexport default Ember.Controller.extend(crud('{{model}}'), {\n\tactions: {\n\t\t{{actions}}\n\t},\n\tfieldDefinition: {\n\t\t{{definition}}\n\t}\n});");
export default class ORMModel {
	valueOf () {
		return this._modelname.toString();
	}
	equals (target) {
		return this._modelname.toString() === target._modelname.toString();
	}
	relation (property, target, mode, foreignKey) {
		let key = foreignKey || `${target}Id`;
		this._relations[property] = [mode, target, key];
	}
	constructor (name, ...args) {
		let [fields, relations = {}] = args;
		if (fields === undefined) {
			throw new Error('fields can\'t be undefined');
		}
		Object.keys(relations).forEach((property) => {
			let opts = relations[property].split(' ');
			opts[2] = opts[2] ? opts[2] : `${property}Id`;
			relations[property] = opts;
		});
		Object.defineProperty(this, '_relations', {
			enumerable: false,
			configurable: false,
			writable: true,
			value: relations || {}
		});
		Object.defineProperty(this, '_modelname', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: new String(inflector.singularize(name.toLowerCase()))
		});
		Object.defineProperty(this._modelname, 'capital', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: inflector.titleize(this._modelname)
		});
		fields = fields.split(' ').map((f) => {
			let field = f.split(':');
			return {
				name: field[0],
				type: field[1]
			};
		});
		fields.forEach(field => {
			Object.defineProperty(this, field.name, {
				enumerable: true,
				configurable: false,
				writable: false,
				value: datatypes[(field.type || 'string').toLowerCase()]
			});
		});
		Object.defineProperty(this, '_fields', {
			get: function () {
				let res = [];
				Object.keys(this).forEach((property) => {
					res.push(`${property}:${this[property].koaton}`);
				});
				return res.join(' ');
			}
		});
	}
	toCaminte () {
		let definition = [];
		Object.keys(this).forEach((key) => {
			definition.push(`${key}:{type:schema.${datatypes[this[key]].caminte}}`);
		});
		let relations = [];
		Object.keys(this._relations).forEach((property) => {
			let opts = this._relations[property];
			let rel = `'${property}':relation.${opts[0]}('${opts[1]}.${opts[2]}')`;
			relations.push(rel);
		});
		return compileCaminte({
			model: definition.join(',\n\t\t\t'),
			relations: relations.join(',\n\t\t\t')
		});
	}
	toEmberModel () {
		let definition = [];
		Object.keys(this).forEach((key) => {
			definition.push(`${key}:attr('${datatypes[this[key]].ember}')`);
		});
		Object.keys(this._relations).forEach((property) => {
			let opts = this._relations[property];
			let rel = `${property}:${opts[0]}('${opts[1]}')`;
			definition.push(rel);
		});
		return compileEmber({
			definition: definition.join(',\n\t')
		});
	}
	toCRUDTable () {
		let definition = [];
		let actions = [];
		Object.keys(this).forEach((key) => {
			let entity = {};
			entity[key] = {};
			let type = this[key].crud;
			switch (type) {
				case 'email':
					entity[key].PlaceHolder = 'account@your.domain';
					break;
				default:

			}
			entity[key].Type = type;
			entity = JSON.stringify(entity);
			definition.push(entity.substr(1, entity.length - 2).replace(/"/igm, '\''));
		});
		Object.keys(this._relations).forEach((property) => {
			let opts = this._relations[property];
			let display = property;
			Object.keys(scfg.database[opts[1]] || {}).some((key) => {
				display = key;
				return true;
			});
			let rel = `'${property}':{Type:'${opts[0]}',Display:'${display}',Source:'_${property}'}`;
			definition.push(rel);
			actions.push(`_${property}(deferred){this.store.findAll('${opts[1]}').then(deferred.resolve,deferred.reject);}`);
		});
		return compileCRUDTable({
			model: this._modelname,
			actions: actions.join(',\n\t\t'),
			definition: definition.join(',\n\t\t')
		});
	}
	toMeta () {
		let relations = {};
		Object.keys(this._relations).forEach((property) => {
			let opts = this._relations[property];
			relations[property] = opts.join(' ');
		});
		let meta = {
			model: this._fields,
			relations: relations
		};
		return meta;
	}
	toJSON () {
		return this.toMeta();
	}
}
