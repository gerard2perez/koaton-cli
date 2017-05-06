import { sync as glob } from 'glob';
import spin from '../spinner';
import {join} from 'path';

export function imagecompressor (files, dest) {
	console.log(files);
	const imagemin = require('imagemin'),
		imageminMozjpeg = require('imagemin-mozjpeg'),
		imageminPngquant = require('imagemin-pngquant');
	return imagemin(files, dest, {
		plugins: [
			imageminMozjpeg({}),
			imageminPngquant({
				// quality: '70-90',
				verbose: true
			})
		]
	}).then((files) => files.length);
}

export function buildAllImages () {
	const spinner = spin();
	spinner.start(50, 'Compressing Images', undefined, process.stdout.columns);
	let subforlders = glob(ProyPath('assets', 'img', '**', '/')); // .map((f) => path.join(f, '*.{jpg,png}'));
	let all = [0];
	for (const folder of subforlders) {
		all.push(imagecompressor([join(folder, '*.{jpg,png}')], join('public', folder.replace(ProyPath('assets'), ''))));
	}
	return Promise.all(all).then((res) => {
		spinner.end(`   ${__ok.green} (${res.reduce((a, b) => a + b)}) Images Compressed`);
	});
}
