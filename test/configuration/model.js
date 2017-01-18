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
		global.scfg = new ServerConfiguaration();
	})
	.Expect('Ask to render help.', '   The command cannot be run this way.\n\tkoaton adapter -h\n   to see help.', (log) => log);

tests.push(new TestNode(cmdname, [undefined, {
	H: true
}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode(cmdname, ['user', 'name lastname age:number email:email', undefined, undefined, undefined, undefined, {
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

tests.push(new TestNode(cmdname, ['user', 'name lastname age:number email:email', undefined, undefined, undefined, undefined, {
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

tests.push(new TestNode(cmdname, ['user', 'name lastname age:number email:email', undefined, undefined, undefined, undefined, {
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

tests.last.CleanUp(() => {
	process.chdir('..');
});

export { tests as config, cmdname as testname };
