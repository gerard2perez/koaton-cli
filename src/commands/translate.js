import 'colors';
import Command from 'cmd-line/lib/Command';
import * as fs from 'fs-extra';
import lang from '../support/Languages';
import * as translate from 'google-translate-api';

export default (new Command(__filename, 'Translate your localization files'))
	.Args('?to', '?from')
	.Options(
		['-l', '--list', 'Show a list of languages'],
		['-g', '--generate', 'indicate to genereate the translation file.']
	)
	.Action(async function (to, from, options) {
		from = from || configuration.server.localization.locales[0];
		if (options.list) {
			for (const key of Object.keys(lang)) {
				console.log(key + ' ' + lang[key]);
			}
			return 0;
		}
		if (!from) {
			console.log('No source locale, please check your configuration');
			return 1;
		}
		if (!lang[to]) {
			console.log('No target locale, please check your configuration');
			return 1;
		}
		if (from === to) {
			console.log('cannot translate to the same language');
			return 0;
		}
		let translation = fs.readJSONSync(ProyPath(configuration.server.localization.directory, `${from}.js`));
		let newLang = {};
		let keys = Object.keys(translation);
		for (const key of keys) {
			newLang[key] = (await translate(encodeURI(translation[key]), {from, to})).text;
		}
		fs.writeFileSync(ProyPath(configuration.server.localization.directory, `${to}.js`), JSON.stringify(newLang, 4, 4));
	});
