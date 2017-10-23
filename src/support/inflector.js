import * as inflector from 'inflection';

let inflectordata;
try {
	inflectordata = require(ProyPath('config', 'inflections'));
} catch (ex) {
	inflectordata = {};
}
const inflections = Object.assign({}, {
	plural: [],
	singular: []
}, inflectordata);

for (const inflect in inflections.singular) {
	inflector.singularize(...inflect);
}

for (const inflect in inflections.plural) {
	inflector.pluralize(...inflect);
}
export default inflector;
