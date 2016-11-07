const chokidar = require('chokidar');
const livereload = require('gulp-livereload');
const spawn = require('cross-spawn');
const fs = require('graceful-fs');
const glob = require('glob');
require('colors');
const kill = require('tree-kill');

let child;
function test() {
	if (child !== undefined) {
		kill(child.pid);
	}
	process.stdout.write('\x1Bc');
	child = spawn("npm", ["test"], {
		shell: true
	});
	child.stdout.on('data', (data) => {
		process.stdout.write(data);
	});
	child.stderr.on('data', (data) => {
		process.stderr.write(data.toString().red);
	});
	child.on('close', function(code) {
		let script = '<script src="http://localhost:62627/livereload.js?snipver=1"></script>\n</body>';
		glob.sync('testcoverage/**/*.html').forEach((file) => {
			let index = fs.readFileSync(file, 'utf-8').replace('</body>', script);
			fs.writeFileSync(file, index, 'utf-8');
		});
		console.log(code === 0 ? 'Passed'.green : 'Failed'.red);
		livereload.reload();
	});
}

var sourcewatcher = chokidar.watch(['src/**/*.js', 'test/**/*.js'], {
	persistent: true,
	ignoreInitial: true,
	alwaysStat: false,
	awaitWriteFinish: {
		stabilityThreshold: 200,
		pollInterval: 90
	}
});
sourcewatcher
	.on('add', () => test())
	.on('change', () => test());

// var targetwatcher = chokidar.watch('testcoverage/**/*.html', {
// 	persistent: true,
// 	ignoreInitial: true,
// 	alwaysStat: false,
// 	awaitWriteFinish: {
// 		stabilityThreshold: 250,
// 		pollInterval: 100
// 	}
// });
//
// targetwatcher
// 	.on('add', path => console.log(`File ${path} has been added`))
// 	.on('change', path => console.log(`File ${path} has been changed`));

// watcher
// 	.on('addDir', path => log(`Directory ${path} has been added`))
// 	.on('unlinkDir', path => log(`Directory ${path} has been removed`))
// 	.on('error', error => log(`Watcher error: ${error}`))
// 	.on('ready', () => log('Initial scan complete. Ready for changes'))
// 	.on('raw', (event, path, details) => {
// 		log('Raw event info:', event, path, details);
// 	});




livereload.listen({
	port: 62627,
	quiet: true
});
test();
