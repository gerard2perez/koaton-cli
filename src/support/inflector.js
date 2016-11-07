import * as i from 'i';

const inflector = i();
const inflections = requireSafe(ProyPath('config', 'inflections'), {
	irregular: [],
	singular: [],
	uncontable: []
});

let irregular = (inflections.plural || [])
	.concat(inflections.singular || [])
	.concat(inflections.irregular || []),
	uncontable = (inflections.uncountable || []).map((inflection) => {
		return `/${inflection}/`
	});
irregular.forEach((inflect) => {
	inflector.inflections.irregular(inflect[0], inflect[1]);
});
uncontable.forEach((inflect) => {
	inflector.inflections.irregular(inflect[0], inflect[1]);
});

export default inflector;
