import * as path from 'path';
import TestNode from '../support/TestNode';
import '../support/array';
import ModelManager from '../../src/modelmanager';
import ServerConfiguaration from '../../src/support/Server';
import requireNoCache from '../support/custom_require';

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
		let model = ModelManager('user', requireNoCache(path.join('models', 'user.js')).default).toMeta();
		return model.relations.onlyone === 'belongsTo onlyone onlyoneId';
	})
	.Expect('Onlyone is not modified', true, (_, project) => {
		let model = ModelManager('onlyone', requireNoCache(path.join('models', 'onlyone.js')).default).toMeta();
		return Object.keys(model.relations).length === 0 && model.relations.user === undefined;
	});
tests.push(new TestNode(cmdname, ['user', 'hasMany', 'post', {
	force: true
}], true, true))
	.Expect('user model has many posts', true, (_, project) => {
		let model = ModelManager('user', requireNoCache(path.join(project, 'models', 'user.js')).default).toMeta();
		return model.relations.onlyone === 'belongsTo onlyone onlyoneId' && model.relations.posts === 'hasMany post postId';
	});
tests.push(new TestNode(cmdname, ['user', 'belongsTo', 'onlyone', {
	force: true
}], true, true))
	.Expect('add a single relation to onlyone -> user', true, (_, project) => {
		let model = ModelManager('onlyone', requireNoCache(path.join(project, 'models', 'onlyone.js')).default).toMeta();
		return model.relations.user === 'belongsTo user userId';
	});

tests.last.CleanUp(() => {
	process.chdir('..');
});

export { tests as config, cmdname as testname };
