import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ModelManager from '../../src/modelmanager';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton relation';
tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
	})
	.Expect('Ask to render help.', '   The command cannot be run this way.\n\tkoaton relation -h\n   to see help.', (log) => log);

tests.push(new TestNode(cmdname, [{
	H: true
}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode(cmdname, ['user', 'hasOne', 'onlyone', {
	force: true
}], true, true))
	.Expect('Creates koaton relation on user model', true, (_, project) => {
		let model1 = ModelManager('user', requireNoCache(path.join(project, 'models', 'user.js')).default);
		let model2 = ModelManager('onlyone', requireNoCache(path.join(project, 'models', 'onlyone.js')).default);
		console.log(model1.toMeta());
		console.log(model2.toMeta());
		return false;
	});
tests.push(new TestNode(cmdname, ['user', 'hasMany', 'post', {
	force: true
}], true, true))
	.Expect('Creates koaton relation on user model', true, (_, project) => {
		let model = ModelManager('user', requireNoCache(path.join(project, 'models', 'user.js')).default);
		// console.log(model.toCaminte());
		// console.log(model.toEmberModel());
		// console.log(model.toCRUDTable());
		// console.log(model.toMeta());
		return false;
		// return model.name.toString() === 'string' &&
		// model.lastname.toString() === 'string' &&
		// model.age.toString() === 'number' &&
		// model.email.toString() === 'email';
	});
tests.push(new TestNode(cmdname, ['user', 'hasMany', 'post', {
	force: true
}], true, true))
	.Expect('Creates koaton relation on user model', true, (_, project) => {
		let model = ModelManager('user', requireNoCache(path.join(project, 'models', 'user.js')).default);
		return false;
	});

tests.last.CleanUp(() => {
	process.chdir('..');
});

export { tests as config, cmdname as testname };
