export function new_compile_(...args) {
	let [text, options] = args;
	for (let prop in options) {
		text = text.split("{{" + prop + "}}").join(options[prop]);
	}
	return text;
}
