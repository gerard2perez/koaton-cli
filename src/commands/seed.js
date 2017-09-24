import 'colors';
import * as fs from 'fs-extra';
import Command from 'cmd-line/lib/Command';
import utils from '../utils';

export default (new Command(__filename, 'Creates or run seed in your project.'))
	.Args('model')
	.Options(['-g', '--generate', 'Generete a seed file for the specified model.'])
	.Action(async function (model, options) {
		process.env.NODE_ENV = 'development';
		fs.ensureDirSync(ProyPath('seeds'));
		if (model && options.generate && scfg.database.models[model] && !utils.canAccess(ProyPath('seeds', `${model}.js`))) {
			console.log('file need creation');
			let [skey, ...keys] = Object.keys(scfg.database[model]);
			skey = {
				[skey]: 'unic'
			};
			let seed = {};
			keys.forEach((key) => {
				seed[key] = '';
			});
			utils.render(TemplatePath('seeds', 'model.handlebars'), ProyPath('seeds', `${model}.js`), {
				model: `${JSON.stringify(skey)},${JSON.stringify(seed)}`
			});
		} else if (!options.generate) {
			await require(ProyPath('node_modules', 'koaton', 'middleware', 'orm')).initializeORM(true);
		}
	});
