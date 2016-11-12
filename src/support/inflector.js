import * as i from 'i';

const inflector = i();
const inflections = Object.assign({}, {
	plural: [],
	irregular: [],
	singular: [],
	uncountable: []
}, requireSafe(ProyPath('config', 'inflections'), {}));

let uncountable = inflections.uncountable.map((inflection) => {
	return [inflection, `/${inflection}/`]
});

inflections.singular.forEach((inflect) => {
	inflector.inflections.singular(inflect[1], inflect[0]);
});

inflections.plural.forEach((inflect) => {
	inflector.inflections.irregular(inflect[0], inflect[1]);
});

inflections.irregular.forEach((inflect) => {
	inflector.inflections.irregular(inflect[0], inflect[1]);
});

uncountable.forEach((inflect) => {
	console.log(inflect)
	inflector.inflections.uncountable(inflect[0]);
});

export default inflector;
