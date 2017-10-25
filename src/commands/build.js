/* eslint no-div-regex: 0 */
import * as path from 'upath';
import copystatic from '../support/CopyStatic';
import utils from '../utils';
import Command from 'cmd-line/lib/Command';
// import spin from '../spinner';
import { buildNginx } from '../functions/nginx';
import { buildAllImages } from '../functions/imagecompressor';
import EmberBuilder from '../support/EmberBuilder';
import { buildCSS, buildJS } from '../functions/builder';
// const spinner = spin();

async function buildApps () {
	if (Object.keys(configuration.ember).length === 0) return 0;
	await Events('pre', 'ember_build');
	for (const appname in configuration.ember) {
		let EmberAPP = new EmberBuilder(appname, scfg.env, configuration.ember[appname]);
		await EmberAPP.build();
		// let cfg = {
		// 	directory: configuration.ember[emberAPP].directory,
		// 	mount: configuration.ember[emberAPP].mount,
		// 	build: scfg.env,
		// 	layout: configuration.ember[emberAPP].layout,
		// 	show: false
		// };
	}
	await Events('post', 'ember_build');
}
async function buildBundles () {
	if (Object.keys(configuration.bundles).length === 0) {
		console.log(`   ${__ok.green} No bundles defined`);
	} else {
		await utils.mkdir(ProyPath('public', 'js'), -1);
		await utils.mkdir(ProyPath('public', 'css'), -1);
		for (let bundle of scfg.bundles) {
			for (let compiledfile of bundle) {
				utils.rmdir(path.join('public', path.normalize(compiledfile)));
			}
		}
		console.log(`   Updating bundles (env: ${scfg.env})`);
		for (const bundle of configuration.bundles) {
			if (bundle.kind === '.css') {
				await buildCSS(bundle.file, bundle.content.slice(0), scfg.env === 'development');
			} else if (bundle.kind === '.js') {
				await buildJS(bundle.file, bundle.content.slice(0), scfg.env === 'development');
			}
		}
	}
}
export default (new Command(
	__filename,
	'Bulds whatever your system needs to build. (bundles, nginxConf, emberapps)'))
	.Options([
		['--nginx', '--nginx', 'Builds nginx config only'],
		['--bundles', '--bundles', 'Builds bundles only'],
		['--apps', '--apps', 'Builds ember apps only'],
		['--images', '--images', 'Comprees all the images'],
		['--static', '--static', 'Copy Static files']
	])
	.Action(async function (options) {
		options.all = !(options.nginx || options.bundles || options.apps || options.images || options.static);
		if (options.nginx || options.all) {
			await buildNginx();
		}
		if (options.bundles || options.all) {
			await buildBundles();
		}
		if (options.apps || options.all) {
			await buildApps();
		}
		if (options.images || options.all) {
			await buildAllImages();
		}
		if (options.static || options.all) {
			await copystatic();
		}
	});
