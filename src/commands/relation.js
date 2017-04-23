import Command from 'cmd-line/lib/Command';
import inflector from '../support/inflector';
import persistmodel from '../functions/persistmodel';

let linkmodes = {
	'hasmany': 'hasmany',
	'belongsto': 'belongsto',
	'hasone': 'hasone'
};
let emberrel = {
	'hasmany': 'hasMany',
	'belongsto': 'belongsTo'
};

export default (new Command(__filename, 'makes a relation betwen two models\n   linkmode: hasMany|belongsTo'))
	.Args('sourcemodel', 'hasMany|hasOne', 'targetmodel')
	.Options([
		['-re', '--relation-property', 'Selects the relation property'],
		['-fe', '--foreing-key', 'Selects the foreing key to use'],
		['-e', '--ember <app>', 'Generates the model also for the app especified.'],
		['-f', '--force', 'Deletes the model if exists.'],
		['-r', '--rest', 'Makes the model REST enabled.']
	])
	.Action(async function (sourcemodel, linkmode, targetmodel, options) {
		if (!sourcemodel || !targetmodel) {
			console.log('   The command cannot be run this way.\n\tkoaton relation -h\n   to see help.'.yellow);
			return 0;
		}
		let mode = linkmodes[linkmode.toLowerCase()];
		if (!mode) {
			console.log(`Invalid mode selected: ${linkmode.red}\nAvaliable options ${'hasMany, belongsTo'.cyan}.`);
			return 501;
		}
		switch (mode) {
			case 'belongsto':
				let tmp = sourcemodel;
				sourcemodel = targetmodel;
				targetmodel = tmp;
				mode = 'belongsto';
				break;
			case 'hasone':
				mode = 'belongsto';
				break;
		}
		let relationProperty = options.relationProperty || mode === linkmodes.hasmany ? inflector.pluralize(targetmodel) : targetmodel;
		let foreignKey = options.foreignKey || inflector.singularize(targetmodel) + 'Id';
		let model = scfg.database[sourcemodel];
		if (!model || !scfg.database[targetmodel]) {
			if (!model) {
				console.log(`Source model (${sourcemodel}) does not exists.`);
			} else {
				console.log(`Target model (${targetmodel}) does not exists.`);
			}
			return 404;
		}
		model.relation(relationProperty, targetmodel, emberrel[mode], foreignKey);
		return await persistmodel(model, sourcemodel, options);
	});
