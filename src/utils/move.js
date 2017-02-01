import 'colors';
import * as fs from 'fs-extra';
import * as path from 'upath';

export default function renameSync (...args) {
	let [origin, target] = args;
	try {
		fs.renameSync(origin, target);
		let po = path.dirname(origin).replace(path.join(process.cwd(), '/'), ''),
			pt = path.dirname(target).replace(path.join(process.cwd(), '/'), ''),
			bo = path.basename(origin),
			bt = path.basename(target);
		while (po !== pt) {
			bo = path.join(path.basename(po), bo);
			po = path.basename(po);
			bt = path.join(path.basename(pt), bt);
			pt = path.basename(pt);
		}
		console.log(`   ${'rename'.cyan}: ${po}/${bo.grey} -> ${bt.green}`);
		return target;
	} catch (e) {
		console.log(e.stack);
	}
	return null;
}
