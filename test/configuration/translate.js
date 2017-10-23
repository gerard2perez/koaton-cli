import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import ServerConfiguaration from '../../src/support/Server';
import '../support/array';
import langs from '../../src/support/Languages';

let tests = [];
let cmdname = 'koaton translate';

tests.push(new TestNode(cmdname, [undefined, undefined, {
	list: true
}], true, true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		require(ProyPath('node_modules', 'koaton/support', 'globals'));
		global.scfg = new ServerConfiguaration();
		scfg.port = 62626;
		global.skipshell = true;
		fs.writeFileSync(ProyPath('locales', 'en.js'), JSON.stringify({t001: 'Hello'}, 4, 4));
	});
for (const lang of Object.keys(langs)) {
	tests.push(new TestNode(cmdname, [lang, undefined, {}], true, true))
		.Expect(`translates to ${langs[lang]}`, true, (log) => {
			if (lang === 'en') {
				return log.indexOf('cannot translate to the same language') > -1;
			} else {
				let translation = fs.readJSONSync(ProyPath('locales', `${lang}.js`));
				return translation.t001 && translation.t001 !== undefined;
			}
		});
}

tests.last.CleanUp(() => {
	process.chdir('..');
});
export { cmdname as testname, tests as config };
