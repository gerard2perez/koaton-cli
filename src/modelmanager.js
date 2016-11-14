import model from './support/ORMModel';
import datatypes from './support/DataTypes';
/**
 * Transform a Koaton model to cli syntax
 * @param {KoatonModelFile} koatonmodel - Content of a KoatonModel.js
 * @return {String} raw cli syntax of the koaton model.
 */
const modelize = function(koatonmodel) {
	let res = [];
	res[0] = [];
	res[1] = [];
	Object.keys(koatonmodel.model).forEach((property) => {
		res[0].push(`${property}:${koatonmodel.model[property].type.koaton}`);
	});
	res[0] = res[0].join(" ");
	return res;
}
const clone = function clone(source) {
	let dest = [];
	for (let i in source) {
		Object.keys(source[i]).forEach((key) => {
			let s = {};
			s[key] = source[i][key];
			dest.push(s);
		});
	}

	return dest;
}
const schema = {
	hasMany(rel) {
		return `hasMany ${rel.split('.').join(' ')}`;
	}
}
schema.belongsTo = schema.hasMany;
export default (n, f, r, m) => {
	let name = n,
		fields = f,
		relations = {},
		models = m || {};
	if (typeof f === 'function') {
		fields = modelize(f(datatypes, schema));
		relations = fields[1];
		fields = fields[0];
	} else {
		relations = clone(r || {});
	}
	return new model(name, fields, relations, models);
};
