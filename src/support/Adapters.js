import ExtendedStrings from './ExtendedStrings';

const template = '{"driver": "{{driver}}","user": "{{user}}","database": "{{application}}","password": "{{password}}","port": {{port}},"host": "{{host}}","pool": false,"ssl": false}';

let adapters = new ExtendedStrings('package');

adapters.add('mongoose','port:27017');
adapters.add('mysql','port:3306');
adapters.add('postgres','port:5432 package:pg');
adapters.add('redis','port:6379');
adapters.add('sqlite3','port:0');
adapters.add('couchdb','port:6984');
adapters.add('neo4j','port:7474');
adapters.add('riak','port:8087');
adapters.add('firebird','port:3050');
adapters.add('tingodb','port:27017');
adapters.add('rethinkdb','port:29015');

adapters.add('mongo:mongoose');
adapters.add('couch:couchdb');
adapters.add('mariadb:mysql');

makeObjIterable(adapters);

Object.defineProperty(adapters, 'isOrDef', {
	enumerable: false,
	configurable: false,
	value: function(adpt) {
		return this[adpt] === undefined ? this.mongo : this[adpt];
	}
});

Object.freeze(adapters);
export {template as Template, adapters as Adapters}
export default adapters;
