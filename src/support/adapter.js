import 'colors';

const npmpackages = {
	"postgres": "pg"
};
const ports = {
	"mongoose": 27017,
	"mysql": 3306,
	"postgres": 5432,
	"redis": 6379,
	"sqlite3": 0,
	"couchdb": 6984,
	"neo4j": 7474,
	"riak": 8087,
	"firebird": 3050,
	"tingodb": 27017,
	"rethinkdb": 29015
};
const alias = {
	'mongoose': ["mongo"],
	'couchdb': ["couch"],
	'mysql': ["mariadb"]
};

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
class ExtendedDatatype extends String {
	constructor(value, transforms) {
		super(value);
		for (const transform of transforms.split(' ')) {
			this.add(transform);
		}
	}
	add(transform) {
		let [target, value] = transform.split(':');
		Object.defineProperty(this, target, {
			enumerable: true,
			writable: false,
			value: value === "undefined" ? undefined : value

		})
	}
}
class DataTypes {
	constructor() {
		Object.defineProperty(this, 'adapters', {
			enumerable: false,
			writable: true,
			value: {}
		})
	}
	add(datatype, transforms) {
		this.adapters[datatype] = new ExtendedDatatype(datatype, transforms);
		Object.defineProperty(this.adapters[datatype], 'koaton', {
			enumerable: false,
			writable: false,
			value: datatype
		});
		Object.freeze(this.adapters[datatype]);
		Object.defineProperty(this, capitalize(datatype), {
			enumerable: false,
			get() {
				//TODO: console.log(`Deprecated: Please use only lower strings for the models datatypes (${capitalize(datatype)})`.yellow);
				return this.adapters[datatype];
			}
		});
		Object.defineProperty(this, datatype, {
			enumerable: true,
			get() {
				return this.adapters[datatype];
			}
		})
	}
}

let datatypes = new DataTypes();
datatypes.add('number', 'ember:number caminte:Number crud:number');
datatypes.add('integer', 'ember:number caminte:Integer crud:number');
datatypes.add('float', 'ember:number caminte:Float crud:number');
datatypes.add('double', 'ember:number caminte:Double crud:number');
datatypes.add('real', 'ember:number caminte:Real crud:number');
datatypes.add('boolean', 'ember:boolean caminte:Boolean crud:boolean');
datatypes.add('string', 'ember:string caminte:String crud:text');
datatypes.add('text', 'ember:string caminte:Text crud:text');
datatypes.add('json', 'ember:undefined caminte:Json crud:undefined');
datatypes.add('date', 'ember:date caminte:Date crud:date');
datatypes.add('email', 'ember:email caminte:Email crud:email');
datatypes.add('password', 'ember:string caminte:String crud:password');
datatypes.add('blob', 'ember:string caminte:Blob crud:text');

let adapters = {};
const getPort = function(adapter) {
	return ports[adapter];
}
const getPackageName = function(adapter) {
	return npmpackages[adapter] || adapter;
}
const hasAlias = function(adapter, ali) {
	return adapter === ali;
}
for (let adapter in ports) {
	adapters[adapter] = new String(adapter);
	Object.defineProperty(adapters[adapter], "port", {
		get: getPort.bind(this, adapter)
	});
	Object.defineProperty(adapters[adapter], "package", {
		get: getPackageName.bind(this, adapter)
	});

	var aliases = Object.keys(alias).filter(hasAlias.bind(this, adapter));
	for (let adp in aliases) {
		for (let al in alias[aliases[adp]]) {
			adapters[alias[aliases[adp]][al]] = adapters[adapter];
		}
	}
}
const engines = ["atpl", "doT", "dust", "dustjs-linkedin", "eco", "ect", "ejs", "haml", "haml-coffee", "hamlet", "handlebars", "hogan", "htmling", "jade", "jazz", "jqtpl", "JUST", "liquor", "lodash", "mote", "mustache", "nunjucks", "QEJS", "ractive", "react", "slm", "swig", "templayed", "twig", "liquid", "toffee", "underscore", "vash", "walrus", "whiskers"];
const tested_engines = ["handlebars", "ejs"];

let avaliablengines = {};
for (let engine in engines) {
	if (tested_engines.indexOf(engines[engine]) > -1) {
		avaliablengines[engines[engine]] = engines[engine];
	}
}
Object.defineProperty(adapters, 'isOrDef', {
	enumerable: false,
	configurable: false,
	value: function(adpt) {
		return this[adpt] === undefined ? this.mongo : this[adpt];
	}
});
Object.defineProperty(avaliablengines, 'isOrDef', {
	enumerable: false,
	configurable: false,
	value: function(adpt) {
		console.log(adpt);
		console.log(this);
		return this[adpt] === undefined ? this.handlebars : this[adpt];
	}
})
makeObjIterable(datatypes);
makeObjIterable(adapters);

Object.freeze(datatypes);
Object.freeze(adapters);

export {
	avaliablengines as engines
};
export {
	datatypes,
	adapters
};
export const template = '{"driver": "{{driver}}","user": "{{user}}","database": "{{application}}","password": "{{password}}","port": {{port}},"host": "{{host}}","pool": false,"ssl": false}';
