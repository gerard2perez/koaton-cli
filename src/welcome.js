import 'colors';
import jut from './jutsus';

const jutsus = jut.S.concat(jut.A, jut.B, jut.C);
const linesize = 59;
const name = 'Koaton';
const ll = name.length > scfg.version.length + 1 ? name.length : scfg.version.length;
const spaces = function spaces (text) {
	let res = text;
	while (res.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').length < ll) {
		res += ' ';
	}
	return res;
};
const center = function center (text) {
	var m = Math.floor((linesize - text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').length) / 2);
	var r = '';
	while (r.length < m) {
		r += ' ';
	}
	return r + text;
};
const line1 = function (dodim) {
	let p = linesize - 6;
	let line = '==='.grey;
	let fill = '';
	while (p > 0) {
		fill += '-';
		p--;
	}
	line += dodim ? fill.dim : fill;
	line += '===\n'.grey;
	console.log(line);
};
const line2 = function () {
	let p = Math.floor((linesize - 3 - 3 - 3) / 2);
	let fill = '';
	while (p > 0) {
		fill += '-';
		p--;
	}
	console.log('   ' + (fill + '===' + fill).dim + '   ');
};
const line3 = function (text) {
	let p = Math.floor((linesize - 3 - 3 - text.length) / 2);
	let fill = '';
	while (p > 0) {
		fill += '-';
		p--;
	}
	console.log('   ' + (fill + text + fill).dim + '   ');
};
const flame =
	center(spaces('') + '      :.           '.red) + '\n' +
	center(spaces('') + '    .!>:;         '.red) + '\n' +
	center(spaces('K'.gray.bold.italic + 'oaton'.grey) + '    .!!!!!:.      '.red) + '\n' +
	center(spaces('v' + scfg.version) + '     .-!!!:;      '.red) + '\n' +
	center(spaces('') + '      ::;>77!.     '.red) + '\n' +
	center(spaces('') + '  -.  !7>7??7:;.   '.red) + '\n' +
	center(spaces('') + ' ;>;.!7?7???7!>>.  '.red) + '\n' +
	center(spaces('') + ';>7;;>?????77777-  '.red) + '\n' +
	center(spaces('') + ';>77!>7????????7:  '.red) + '\n' +
	center(spaces('') + ' ;!777????????7:.  '.red) + '\n' +
	center(spaces('') + '   .-:!!>>!!:;. '.red);
export default {
	line1: line1,
	line2: line2,
	line3: line3,
	start () {
		console.log('Starting Server'.grey + ' ...'.grey.dim);
		console.log(
			flame.replace(/!/gim, '!'.dim.italic.bold)
				.replace(/:/gim, ':'.bold)
				.replace(/\?/gim, '?'.dim)
				.replace(/\./gim, '.'.dim.bold)
		);
		line1();
		const index = Math.floor((Math.random() * jutsus.length));
		console.log(center('Koaton: ' + jutsus[index].name.red));
		line1(true);
	}
};
