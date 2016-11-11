const engines = ["atpl", "doT", "dust", "dustjs-linkedin", "eco", "ect", "ejs", "haml", "haml-coffee", "hamlet", "handlebars", "hogan", "htmling", "jade", "jazz", "jqtpl", "JUST", "liquor", "lodash", "mote", "mustache", "nunjucks", "QEJS", "ractive", "react", "slm", "swig", "templayed", "twig", "liquid", "toffee", "underscore", "vash", "walrus", "whiskers"];
const tested_engines = ["handlebars"];

let avaliablengines = {};
for (let engine in engines) {
	if (tested_engines.indexOf(engines[engine]) > -1) {
		avaliablengines[engines[engine]] = engines[engine];
	}
}

Object.defineProperty(avaliablengines, 'isOrDef', {
	enumerable: false,
	configurable: false,
	value: function(adpt) {
		return this[adpt] === undefined ? this.handlebars : this[adpt];
	}
});

makeObjIterable(avaliablengines);
Object.freeze(avaliablengines);

export default avaliablengines;
