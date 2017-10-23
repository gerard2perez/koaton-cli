import challenge from '../utils/challenge';
import write from '../utils/write';
import * as fs from 'fs-extra';
import { join } from 'path';

export default async function persistmodel (model, modelname, options) {
	let override = await challenge(ProyPath('models', `${modelname}.js`), `The model ${modelname.green} already exits,do you want to override it?`, options.force);
	if (override) {
		write(ProyPath('models', modelname + '.js'), model.toCaminte());
		if (options.rest) {
			var restcontroller = "'use strict';\nexports.default = {\n\tREST:true\n};";
			write(ProyPath('controllers', `${modelname.toLowerCase()}.js`), restcontroller);
		}
	}
	if (override && options.ember) {
		/* istanbul ignore next */
		if (!fs.existsSync(ProyPath('/ember/', options.ember))) {
			console.log(`The app ${options.ember} does not exists.`.red);
			return 1;
		}
		write(ProyPath('ember', options.ember, 'app', 'models', modelname + '.js'), model.toEmberModel());
		/* istanbul ignore else */
		if (options.rest) {
			write(ProyPath('ember', options.ember, 'app', 'controllers', `${modelname}.js`), model.toCRUDTable());
			write(
				ProyPath('ember', options.ember, 'app', 'templates', `${modelname}.hbs`),
				'{{crud-table\n\tfields=this.fieldDefinition\n}}'
			);
			let router = fs.readFileSync(join(process.cwd(), 'ember', options.ember, 'app', 'router.js'), {
				encoding: 'utf-8'
			});
			/* istanbul ignore else */
			if (router.indexOf(`this.route('${modelname}')`) === -1) {
				router = router.replace(/Router.map\(.*?function\(.*?\).*?{/igm, `Router.map(function() {\n\tthis.route('${modelname}');\n`);
				write(ProyPath('ember', options.ember, 'app', 'router.js'), router, 1);
			}
		}
	}
	/* istanbul ignore else */
	if (scfg.database.has(model)) {
		scfg.database.remove(model);
	}
	scfg.database.add(model);
	return 0;
}
