import 'colors';
import * as fs from 'graceful-fs';
import * as path from 'path';
import datatypes from '../support/Adapters';
import utils from '../utils';
import command from '../command';
import ModelManager from '../modelmanager';
import inflector from '../support/inflector';

let description = `Creates a new model. fields must be sourrounded by "".
	${"Fields syntax".yellow}:
		${"field_name"}:${"type".cyan}	${"[ ".yellow+Object.keys(datatypes).map((c)=>{return c.toLowerCase().cyan}).join( " | ".yellow )+" ]".yellow}
	${"example:".yellow}
		koaton model User "active:integer name email password note:text created:date"\n\t\tkoaton model User hasmany Phone as Phones\nkoaton model User hasmany Phone phones phoneId
`;
const emberrel = [
		"",
		"hasMany",
		"belongsTo"
	],
	linkactions = {
		no: 0,
		hasmany: 1,
		belongsto: 2
	};
export default (new command(__filename, description))
.Args("name", "fields|linkaction", "[destmodel]", "as", "[relation_property]", "[foreign_key]")
	.Options([
		["-e", "--ember <app>", "Generates the model also for the app especified."],
		["-f", "--force", "Deletes the model if exists."],
		["-r", "--rest", "Makes the model REST enabled."]
	])
	.Action(async function(...args) {
		let [name, fields, destmodel, as, relation_property, foreign_key, options] = args;
		if (!name || !fields) {
			console.log('   The command cannot be run this way.\n\tkoaton adapter -h\n   to see help.'.yellow);
			return 0;
		}
		let modelname = inflector.singularize(name.toLowerCase()),
			cmd = `koaton model ${modelname} ${fields} ${destmodel||""} ${as||""} ${relation_property||""} ${foreign_key||""}`.trim(),
			key = foreign_key || "",
			targetmodel = inflector.singularize((destmodel || "").toLowerCase());

		scfg.commands.add(cmd);
		let linkaction = null,
			relations = scfg.database.has(modelname) ? scfg.database.relations[modelname] : [];
		if (as === "as") {
			linkaction = linkactions[fields.toLowerCase()]
			let relation = {};
			fields = scfg.database.models[modelname];
			relation[`${relation_property}`] = `${emberrel[linkaction]} ${targetmodel} ${key}`;
			relations.push(relation);
		}
		let model = ModelManager(modelname, fields, relations, scfg.database.models),
			override = await utils.challenge(ProyPath("models", `${modelname.toLowerCase()}.js`), `The model ${modelname.green} already exits,do you want to override it?`, options.force);

		if (override) {
			utils.write(ProyPath("models", modelname + ".js"), model.toCaminte());
			if (options.rest) {
				var restcontroller = `"use strict";\nmodule.exports = {\n\tREST:true\n};`;
				utils.write(ProyPath("controllers", `${modelname.toLowerCase()}.js`), restcontroller);
			}
		}
		if (override && options.ember) {
			if (!fs.existsSync(ProyPath("/ember/", options.ember))) {
				console.log(`The app ${options.ember} does not exists.`.red);
				return 1;
			}
			utils.write(ProyPath("ember", options.ember, "app", "models", modelname + ".js"), model.toEmberModel());
			if (options.rest) {
				utils.write(ProyPath("ember", options.ember, "app", "controllers", `${modelname}.js`), model.toCRUDTable());
				utils.write(
					ProyPath("ember", options.ember, "app", "templates", `${modelname}.hbs`),
					`{{crud-table\n\tfields=this.fieldDefinition\n}}`
				);
				let router = await utils.read(path.join(process.cwd(), "ember", options.ember, "app", "router.js"), {
					encoding: "utf-8"
				});
				if (router.indexOf(`this.route('${modelname}')`) === -1) {
					router = router.replace(/Router.map\(.*?function\(.*?\).*?{/igm, `Router.map(function() {\n\tthis.route('${modelname}');\n`);
					utils.write(ProyPath("ember", options.ember, "app", "router.js"), router, 1);
				}
			}
		}
		if (scfg.database.has(model)) {
			scfg.database.remove(model);
		}
		scfg.database.add(model);
		return 0;
	});
