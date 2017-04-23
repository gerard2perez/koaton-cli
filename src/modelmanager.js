import Model from './support/ORMModel';
import datatypes from './support/DataTypes';
/**
 * Transform a Koaton model to cli syntax
 * @param {KoatonModelFile} koatonmodel - Content of a KoatonModel.js
 * @return {String} raw cli syntax of the koaton model.
 */
const modelize = function (koatonmodel) {
	let res = [];
	res[0] = [];
	res[1] = koatonmodel.relations;
	Object.keys(koatonmodel.model).forEach((property) => {
		res[0].push(`${property}:${koatonmodel.model[property].type.koaton}`);
	});
	res[0] = res[0].join(' ');
	return res;
};
const clone = function clone (source) {
	let dest = [];
	for (let i in source) {
		Object.keys(source[i]).forEach((key) => {
			let s = {};
			s[key] = source[i][key];
			dest.push(s);
		});
	}

	return dest;
};
const schema = {
	belongsTo (rel) {
		return `belongsTo ${rel.split('.').join(' ')}`;
	},
	hasMany (rel) {
		return `hasMany ${rel.split('.').join(' ')}`;
	},
	manyToMany (rel) {
		return `manyToMany ${rel.targetModel}`;
	}
};
export default (...args) => {
	let [name, fields, relations = {}, models = {}] = args;
	if (typeof fields === 'function') {
		fields = modelize(fields(datatypes, schema));
		relations = fields[1];
		fields = fields[0];
	} else {
		relations = clone(relations || {});
	}
	return new Model(name, fields, relations, models);
};
