import datatypes from '../support/DataTypes';
import Command from 'cmd-line/lib/Command';
import inflector from '../support/inflector';

let description = `Creates a new model. fields must be sourrounded by "".
       ${'Fields syntax'.yellow}:
         ${'field_name'}:${'type'.cyan}	${'[ '.yellow + Object.keys(datatypes).map((c) => {
	return c.toLowerCase().cyan;
}).join(' | '.yellow) + ' ]'.yellow}
       ${'example:'.yellow}
         koaton model User 'active:integer name email password note:text created:date'
         koaton model User hasmany Phone as Phones
         koaton model User hasmany Phone phones phoneId
`;
import persistmodel from '../functions/persistmodel';

export default (new Command(__filename, description))
	.Args('name', 'fields')
	.Options([
		['-e', '--ember <app>', 'Generates the model also for the app especified.'],
		['-f', '--force', 'Deletes the model if exists.'],
		['-r', '--rest', 'Makes the model REST enabled.']
	])
	.Action(async function (name, fields, options) {
		if (!name || !fields) {
			console.log('   The command cannot be run this way.\n\tkoaton model -h\n   to see help.'.yellow);
			return 0;
		}
		let modelname = inflector.singularize(name.toLowerCase()),
			cmd = `koaton model ${modelname} ${fields}`;

		scfg.commands.add(cmd);
		let model = scfg.database[modelname] || scfg.database.add(modelname, fields)[modelname];
		return await persistmodel(model, modelname, options);
	});
