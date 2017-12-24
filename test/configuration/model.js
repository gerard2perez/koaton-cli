import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ModelManager from '../../src/modelmanager';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton model';
tests.push(new TestNode('(no args)', [undefined, {}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		fs.removeSync(ProyPath('models', 'category.js'));
		fs.removeSync(ProyPath('models', 'onlyone.js'));
		fs.removeSync(ProyPath('models', 'post.js'));
		fs.removeSync(ProyPath('models', 'user.js'));
		fs.removeSync(ProyPath('.koaton'));
		global.scfg = new ServerConfiguaration();
		// scfg.database = {};
		for (const lib of Object.keys(require.cache)) {
			if (lib.indexOf('user.js') > -1) {
				delete require.cache[lib];
			}
		}
	})
	.Expect('Ask to render help.', '   The command cannot be run this way.\n\tkoaton model -h\n   to see help.', (log) => log);

tests.push(new TestNode(cmdname, [{
	H: true
}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode(cmdname, ['user', 'name lastname age:number email:email', {
	force: true
}], true, true))
	.Expect('Updates .koaton', true, (_, project) => {
		let koaton = fs.readFileSync(path.join(project, '.koaton'), 'utf-8');
		return koaton.indexOf('name:string lastname:string age:number email:email') > -1;
	})
	.Expect('Creates koaton model', true, (_, project) => {
		let model = ModelManager('user', require(path.join(project, 'models', 'user.js')).default);
		return model.name.toString() === 'string' &&
		model.lastname.toString() === 'string' &&
		model.age.toString() === 'number' &&
		model.email.toString() === 'email';
	});

tests.push(new TestNode(cmdname, ['user', 'name lastname age:number email:email', {
	force: true,
	rest: true
}], true, true))
	.Expect('Updates .koaton', true, (_, project) => {
		let koaton = fs.readFileSync(path.join(project, '.koaton'), 'utf-8');
		return koaton.indexOf('name:string lastname:string age:number email:email') > -1;
	})
	.Expect('Creates koaton model with rest suport', true, (_, project) => {
		let model = ModelManager('user', require(path.join(project, 'models', 'user.js')).default);
		let REST = require(path.join(project, 'controllers', 'user.js')).default.REST;
		return model.name.toString() === 'string' &&
		model.lastname.toString() === 'string' &&
		model.age.toString() === 'number' &&
		model.email.toString() === 'email' &&
		REST;
	});

tests.push(new TestNode(cmdname, ['user', 'name lastname age:number email:email', {
	force: true,
	ember: 'restapp',
	rest: true
}], true, true))
	.Expect('Updates .koaton', true, (_, project) => {
		let koaton = fs.readFileSync(path.join(project, '.koaton'), 'utf-8');
		return koaton.indexOf('name:string lastname:string age:number email:email') > -1;
	})
	.Expect('Creates koaton model with full ember support', true, (_, project) => {
		let model = ModelManager('user', require(path.join(project, 'models', 'user.js')).default);
		let REST = require(path.join(project, 'controllers', 'user.js')).default.REST;
		let embercontroller = fs.readFileSync(path.join(project, 'ember', 'restapp', 'app', 'controllers', 'user.js'), 'utf-8');
		let embermodel = fs.readFileSync(path.join(project, 'ember', 'restapp', 'app', 'models', 'user.js'), 'utf-8');
		let emberemplate = fs.accessSync(path.join(project, 'ember', 'restapp', 'app', 'templates', 'user.hbs'));
		return model.name.toString() === 'string' &&
		model.lastname.toString() === 'string' &&
		model.age.toString() === 'number' &&
		model.email.toString() === 'email' &&
		REST &&
		embermodel === model.toEmberModel() &&
		embercontroller === model.toCRUDTable() &&
		emberemplate === undefined;
	});
tests.push(new TestNode(cmdname, ['post', 'date:date tags content', {
	force: true,
	rest: true
}], true, true))
	.Expect('Creates koaton model', true, (_, project) => {
		let model = ModelManager('post', require(path.join(project, 'models', 'post.js')).default);
		return model.date.toString() === 'date' &&
		model.tags.toString() === 'string' &&
		model.content.toString() === 'string';
	});
tests.push(new TestNode(cmdname, ['category', 'name', {
	force: true,
	rest: true
}], true, true))
	.Expect('Creates koaton model', true, (_, project) => {
		let model = ModelManager('category', require(path.join(project, 'models', 'category.js')).default);
		return model.name.toString() === 'string';
	});

tests.push(new TestNode(cmdname, ['onlyone', 'name', {
	force: true,
	rest: true
}], true, true))
	.Expect('Creates koaton model', true, (_, project) => {
		let model = ModelManager('onlyone', require(path.join(project, 'models', 'onlyone.js')).default);
		return model.name.toString() === 'string';
	});
tests.last.CleanUp(() => {
	process.chdir('..');
});

export { tests as config, cmdname as testname };
