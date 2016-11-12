import inflector from './inflector';
import datatypes from './DataTypes';

export default class Model {
	valueOf() {
		return this._modelname.toString();
	}
	equals(target) {
		return this._modelname.toString() === target._modelname.toString();
	}
	constructor(...args) {
		let [name, fields, relations, allmodels] = args;
		relations.forEach((relation) => {
			Object.keys(relation).forEach((property) => {
				let opts = relation[property].split(" ");
				opts[2] = opts[2] ? opts[2] : `${property}Id`;
				relation[property] = opts;
			});
		});
		Object.defineProperty(this, '_relations', {
			enumerable: false,
			configurable: false,
			writable: false,
			value: relations
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

		if (fields !== undefined) {
			fields = fields.split(' ').map((f) => {
				let field = f.split(':');
				return {
					name: field[0],
					type: field[1]
				};
			});
			fields.forEach(((field) => {
				Object.defineProperty(this, field.name, {
					enumerable: true,
					configurable: false,
					writable: false,
					value: datatypes[  inflector.titleize(field.type || "String")]
				});
			}));
		}
		Object.defineProperty(this, '_fields', {
			/*enumerable: false,
			configurable: false,
			writable: false,*/
			get: function() {
				let res = [];
				Object.keys(this).forEach((property) => {
					res.push(`${property}:${this[property].koaton}`);
				})
				return res.join(' ');
			}
		});
	}
	toCaminte() {
		let definition = [];
		Object.keys(this).forEach((key) => {
			definition.push(`${key}:{type:schema.${datatypes[this[key]].caminte}}`);
		});
		let relations = [];
		this._relations.forEach((relation) => {
			Object.keys(relation).forEach((property) => {
				let opts = relation[property];
				let rel = `"${property}":relation.${opts[0]}("${opts[1]}.${opts[2]}")`;
				if (relations.join(",").indexOf(rel) === -1) {
					relations.push(rel);
				}
			});
		});
		return `"use strict";
module.exports = function(schema,relation) {
	return {
		model: {
			${definition.join(',\n\t\t\t')}
		},
		extra: {},
		relations: {
			${relations.join(',\n\t\t\t')}
		}
	};
};`;
	}
	toEmberModel() {
		let definition = [];
		Object.keys(this).forEach((key) => {
			definition.push(`${key}:attr('${datatypes[this[key]].ember}')`);
		});
		this._relations.forEach((relation) => {
			Object.keys(relation).forEach((property) => {
				let opts = relation[property];
				let rel = `${property}:${opts[0]}("${opts[1]}")`;
				if (definition.join(",").indexOf(rel) === -1) {
					definition.push(rel);
				}
			});
		});
		return `import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
export default Model.extend({
	${definition.join(',\n\t')}
});`;
	}
	toCRUDTable(HM) {
		let HOSTMODEL = HM || {
			fields: {}
		};
		let definition = [];
		let actions = [];
		Object.keys(this).forEach((key) => {
			let entity = {};
			entity[key] = {};
			let type = this[key].crud;
			switch (type) {
				case "email":
					entity[key].PlaceHolder = 'account@your.domain';
					break;
				default:

			}
			entity[key].Type = type;
			if (HOSTMODEL.fields[key]) {
				Object.keys(HOSTMODEL.fields[key]).forEach((dfield) => {
					entity[key][dfield] = HOSTMODEL.fields[key][dfield];
				});
			}
			entity = JSON.stringify(entity);
			definition.push(entity.substr(1, entity.length - 2));
		});
		this._relations.forEach((relation) => {
			Object.keys(relation).forEach((property) => {
				let opts = relation[property];
				let rel = `${property}:{Type:"${opts[0]}",Display:"${opts[3]}",Source:"_${property}"}`;
				if (definition.join(",").indexOf(rel) === -1) {
					definition.push(rel);
					actions.push(`_${property}(deferred){this.store.findAll('${opts[1]}').then(deferred.resolve,deferred.reject);}`)
				}
			});
		});
		return `import Ember from 'ember';
import crud from 'ember-cli-crudtable/mixins/crud-controller';
export default Ember.Controller.extend(crud('${this._modelname}'), {
	actions: {
		${actions.join(',\n\t\t')}
	},
	fieldDefinition: {
		${definition.join(',\n\t\t')}
	}
});
`;
	}
	toMeta() {
		let relations = [];
		this._relations.forEach((relation) => {
			Object.keys(relation).forEach((property) => {
				let opts = relation[property];
				let rel = {};
				rel[property] = opts.join(' ');
				let none = false;
				relations.forEach((relobj) => {
					Object.keys(relobj).forEach((key) => {
						if (key === property) {
							none = true;
						}
					});
				})
				if (!none) {
					relations.push(rel);
				}
			});
		});
		let meta = {
			model: this._fields,
			relations: relations
		}
		return meta;
	}
	toJSON() {
		return this.toMeta();
	}
}
