import utils from '../utils';
import * as fs from 'fs-extra';
import * as path from 'path';

export default async function persistmodel (model, modelname, options) {
	let override = await utils.challenge(ProyPath('models', `${modelname}.js`), `The model ${modelname.green} already exits,do you want to override it?`, options.force);
	if (override) {
		utils.write(ProyPath('models', modelname + '.js'), model.toCaminte());
		if (options.rest) {
			var restcontroller = "'use strict';\nexports.default = {\n\tREST:true\n};";
			utils.write(ProyPath('controllers', `${modelname.toLowerCase()}.js`), restcontroller);
		}
	}
	if (override && options.ember) {
		/* istanbul ignore next */
		if (!fs.existsSync(ProyPath('/ember/', options.ember))) {
			console.log(`The app ${options.ember} does not exists.`.red);
			return 1;
		}
		utils.write(ProyPath('ember', options.ember, 'app', 'models', modelname + '.js'), model.toEmberModel());
		/* istanbul ignore else */
		if (options.rest) {
			utils.write(ProyPath('ember', options.ember, 'app', 'controllers', `${modelname}.js`), model.toCRUDTable());
			utils.write(
				ProyPath('ember', options.ember, 'app', 'templates', `${modelname}.hbs`),
				'{{crud-table\n\tfields=this.fieldDefinition\n}}'
			);
			let router = await utils.read(path.join(process.cwd(), 'ember', options.ember, 'app', 'router.js'), {
				encoding: 'utf-8'
			});
			/* istanbul ignore else */
			if (router.indexOf(`this.route('${modelname}')`) === -1) {
				router = router.replace(/Router.map\(.*?function\(.*?\).*?{/igm, `Router.map(function() {\n\tthis.route('${modelname}');\n`);
				utils.write(ProyPath('ember', options.ember, 'app', 'router.js'), router, 1);
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
