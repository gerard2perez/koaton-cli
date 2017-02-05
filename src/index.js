import 'colors';
import CMD from 'cmd-line';
import './globals';

// process.env.NODE_ENV = process.argv.indexOf('-p') > -1 || process.argv.indexOf('--production') > -1 ? 'production' : 'development';
// process.env.port = parseInt(process.argv[process.argv.indexOf('--port') + 1], 10) || 62626;
if (process.argv.indexOf('-h') > -1 || process.argv.indexOf('--help') > -1 || process.argv.length === 2) {
	process.env.renderhelp = true;
}
const cmdtest = new CMD('koaton');
cmdtest.loadcommands(__dirname)
	.arguments((args) => {
		return args.map((arg) => {
			if (arg.indexOf('?') > -1) {
				return `[${arg.replace('?', '').cyan}]`;
			} else {
				return `{${arg.green}}`;
			}
		}).join(' ');
	})
	.includehostcommands()
	.execute(process.argv).catch((err) => {
		console.log(err);
	}).then((res) => {
		process.exit(res);
	});
