import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton modulify';

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		requireNoCache(ProyPath('node_modules', 'koaton/lib/support', 'globals'));
		global.skipshell = true;
	})
	.Expect('Command Executed', true, () => true)
	.Exists('koaton_module_package', 'testingapp', 'commands')
	.Exists('koaton_module_package', 'testingapp', 'routes.js')
	.Exists('koaton_module_package', 'testingapp', 'config', 'ember.js')
	.Exists('koaton_module_package', 'testingapp', 'config', 'server.js')
	.Exists('koaton_module_package', 'testingapp', 'public', 'css', '0admin.css')
	.Exists('koaton_module_package', 'testingapp', 'public', 'js', 'admin.js.map')
	.Exists('koaton_module_package', 'testingapp', 'public', 'js', 'admin.min.js')
	.Exists('koaton_module_package', 'testingapp', 'public', 'img', 'logo.png')
	.Exists('koaton_module_package', 'testingapp', 'public', 'restapp')
	.Exists('koaton_module_package', 'testingapp', 'views', 'index.html')
	.Exists('koaton_module_package', 'testingapp', 'views', 'ember_apps', 'restapp.handlebars')
	.Exists('koaton_module_package', 'testingapp', 'views', 'layouts', 'testingapp.handlebars')
	.Exists('koaton_module_package', 'testingapp', 'events')
	.Exists('koaton_module_package', 'testingapp', 'controllers', 'user.js')
	.Exists('koaton_module_package', 'testingapp', 'models', 'user.js');

tests.last.CleanUp(() => {
	process.chdir('..');
});
export { tests as config, cmdname as testname };
