export default class Command {
	constructor (name, description) {
		this.cmd = name.split(/[\\/]/).pop().replace('.js', '');
		this.description = description;
		this.args = [];
		this.options = [
			['-h', '-h', 'Show the help for this command']
		];
		this.action = null;
	}
	Args (...args) {
		this.args = args || [];
		return this;
	}
	Options (optionArray) {
		if (optionArray instanceof Array && optionArray[0] instanceof Array) {
			optionArray.forEach((option) => {
				this.options.push(option);
			});
		} else if (optionArray instanceof Array) {
			this.options.push(optionArray);
		}
		return this;
	}
	Action (fn) {
		let that = this;
		this.action = async function (...args) {
			if (args[args.length - 1].H) {
				console.log(that.Help);
				return 0;
			}
			return await fn.apply(this, args);
		};
		return this;
	}
	get Help () {
		let help = '';
		var args = this.args.length > 0 ? `<${this.args.join('> <')}>` : '';
		var opts = this.options.length > 0 ? '[options]' : '';

		help += `    koaton ${this.cmd} ${args.yellow} ${opts.cyan}\n`;
		help += `      ${this.description.replace('\n', '\n   ')}\n`;

		let longest = 0;
		let varlen = 0;
		let options = this.options.map((option) => {
			let shortag = option[0];
			let [tag, variable] = option[1].split(' ');
			shortag = shortag === tag ? '' : shortag;
			variable = (variable || '');
			if ((tag.length + shortag.length) > longest) {
				longest = tag.length + shortag.length;
			}
			if (varlen < variable.length) {
				varlen = variable.length;
			}
			if (shortag === '') {
				shortag = tag;
				tag = '';
			}
			return [shortag, tag, variable, option[2]]; // `      ${shortag.cyan} ${tag.gray} ${variable.cyan} ${option[2]}\n`;
		});
		longest += 4;
		options.forEach((option) => {
			let [shortag, tag, variable, description] = option;
			let data = `${shortag}  ${tag}`;
			let fill = '',
				varfill = '';
			while ((data.length + fill.length) < longest) {
				fill += ' ';
			}
			if (variable.length > 0) {
				while (varlen > (variable.length + varfill.length)) {
					varfill += ' ';
				}
				variable = ` ${variable.cyan}`;
			}
			help += `        ${shortag.cyan}  ${tag.gray}${fill}${variable}${varfill} ${description}\n`;
		});
		return help + '\n\n';
	}
}
