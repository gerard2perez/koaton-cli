import 'colors';
import Command from 'cmd-line/lib/Command';
import * as fs from 'fs-extra';
import lang from '../support/Languages';

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
		const GET = require('../functions/get').default;
		/* istanbul ignore next */
		async function translate (text, from, to) {
			let r;
			r = JSON.parse(await GET(`http://api.mymemory.translated.net/get?q=${encodeURI(text)}&langpair=${from}|${to}`, null, null));
			if (r.responseData.translatedText.indexOf('YOU USED ALL AVAILABLE FREE TRANSLATIONS') > -1) {
				r = await GET(`http://translate.google.com/translate_a/single?client=ctx&sl=${from}&tl=${to}&hl=es&dt=t&q=${encodeURI(text)}`);
				return r[0][0][0];
			} else if (r.responseStatus === 200) {
				return r.responseData.translatedText.replace(new RegExp(`\b${from}$`, 'g'), to);
			} else if (r.responseStatus === 403) {
				return null;
			} else {
				console.log(lang[to], r.responseData);
				return text;
			}
		}
		let translation = fs.readJSONSync(ProyPath(configuration.server.localization.directory, `${from}.js`));
		let newLang = {};
		let keys = Object.keys(translation);
		for (const key of keys) {
			newLang[key] = await translate(translation[key], from, to);
		}
		fs.writeFileSync(ProyPath(configuration.server.localization.directory, `${to}.js`), JSON.stringify(newLang, 4, 4));
	});
