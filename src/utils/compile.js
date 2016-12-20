export default function Compile (...args) {
	let [text, options] = args;
	for (let prop in options) {
		text = text.split('{{' + prop + '}}').join(options[prop]);
	}
	return text;
}
