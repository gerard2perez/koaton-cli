import * as path from 'path';
import 'colors';
import Command from 'cmd-line/lib/Command';
import adapters from '../support/Adapters';
import utils from '../utils';
const template = '{"driver": "{{driver}}","user": "{{user}}","database": "{{application}}","password": "{{password}}","port": {{port}},"host": "{{host}}","pool": false,"ssl": false}';

const handleGenerate = async function handleGenerate (driver, options) {
	if (!options.generate) {
		await utils.shell(`Installing ${adapters[driver].package.green}`, ['npm', 'i', adapters[driver].package, '--save'], process.cwd());
		delete require.cache[path.resolve() + '/package.json'];
		console.log(`${driver}@${require(path.resolve() + '/package.json').dependencies[adapters[driver].package]} installed`);
	}
	let adapterCFG = JSON.parse(utils.compile(template, {
		adapter: driver,
		driver: adapters[driver].package,
		user: options.user || '',
		password: options.pass || '',
		host: options.host || 'localhost',
		port: options.port || adapters[driver].port,
		application: options.db || path.basename(process.cwd())
	}), '\t');
	if (driver === 'sqlite3') {
		delete adapterCFG.port;
		delete adapterCFG.host;
		delete adapterCFG.pool;
		delete adapterCFG.ssl;
	}
	let connections = require(ProyPath('config', 'connections'));
	connections[driver] = adapterCFG;
	const output = "'use strict';\nmodule.exports=" + JSON.stringify(connections, null, '\t') + ';';
	utils.write(ProyPath('config', 'connections.js'), output, true);
};
const renderdriverlist = function renderdriverlist (installed, available) {
	console.log('    Installed drivers: ');
	for (const driver in installed) {
		console.log(`      ${driver}@${installed[driver].cyan}`);
	}
	console.log('\n    Available drivers: ');
	for (const driver in available) {
		console.log(`      ${driver}`);
	}
};
export default (new Command(
	__filename,
	'Install the especified driver adapter.'))
	.Args('driver')
	.Options([
		['-l', '--list', 'Show the adapters installed in the current application. ' + 'koaton adapter -l'.bgWhite.black],
		['-u', '--uninstall', 'Removes the driver'],
		['-g', '--generate', 'Creates an adapter template for the especified driver'],
		['--host', '--host <hostname> <asa>', 'Default is localhost. Use this with -g'],
		['--port', '--port <port>', 'Default driver port. Use this with -g'],
		['--user', '--user <username>', "User to connect to database default is ''. Use this with -g"],
		['--db', '--db <databse>', "Database name for the connection default is ''. Use this with -g"],
		['--pass', '--pass <password>', "Password to login in your database default is ''. Use this with -g"]
	])
	.Action(async function (driver, options) {
		if (!driver && !options.list) {
			console.log('   The command cannot be run this way.\n\tkoaton adapter -h\n   to see help.'.yellow);
			return 0;
		}
		const dependencies = require(path.resolve() + '/package.json').dependencies;
		let installed = {};
		let available = {};
		for (const adapter of adapters) {
			if (dependencies[adapter.package] !== undefined) {
				installed[adapter.toString()] = adapter.package;
			} else {
				available[adapter.toString()] = adapter.package;
			}
		}
		if (!driver && options.list) {
			renderdriverlist(installed, available);
		} else if (driver && !adapters[driver]) {
			console.log('  The driver you especied is not available please check: '.yellow + '\n');
			renderdriverlist(installed, available);
		} else if (options.uninstall) {
			await utils.shell(`Uninstalling ${adapters[driver].green}`, ['npm', 'uninstall', adapters[driver].package], process.cwd());
		} else {
			await handleGenerate(driver, options);
		}
		return 0;
	});
