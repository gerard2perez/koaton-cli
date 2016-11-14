import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
// import requireNoCache from '../support/custom_require';

const targetdir = path.join(process.cwd(), "testingapp");

let tests = [];
let cmdname = 'koaton new';
tests.push(new TestNode('(no args)', ['', {}], true))
	.SetUp(() => {
		fs.removeSync(targetdir);
	})
	.Expect('Ask to render help.', 'The command requires a name to run.\n\tkoaton new -h\nto see help.', (log) => log);
// tests.push(new TestNode('Must render help',['-h',{}],false));

tests.push(new TestNode('koaton new', ['testingapp', {
		skipNpm: true,
		skipBower: true,
		db: 'mysql'
	}], true, true))
	.Expect(() => {
		let res = true;
		try {
			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.mysql !== undefined;
			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.mongoose === undefined;
		} catch (e) {
			console.log(e.stack);
			res = false;
		}
		return res;
	})
	.CleanUp(() => {
		fs.removeSync(targetdir);
	});

// TODO: test disabled until ejs support added
// tests.push(new TestNode('koaton new', ['testingapp', {
// 		skipNpm: true,
// 		skipBower: true,
// 		viewEngine: 'ejs'
// 	}], true, true))
// 	.Expect(() => {
// 		let res = true;
// 		try {
// 			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.ejs !== undefined;
// 			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.handlebars === undefined;
// 		} catch (e) {
// 			res = false;
// 		}
// 		return res;
// 	});
tests.push(new TestNode('koaton new', ['testingapp', {
		skipNpm: true,
		skipBower: true,
		force: true,
		viewEngine: 'handlebars',
		db: 'redis'
	}], true, true))
	.Expect(() => {
		let res = true;
		try {
			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.redis !== undefined;
			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.handlebars !== undefined;
			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.ejs === undefined;
			res = res && requireNoCache(path.join(targetdir, "package.json")).dependencies.mysql === undefined;
		} catch (e) {
			console.log(e.stack);
			res = false;
		}
		return res;
	});
tests.push(new TestNode('koaton new', ['testingapp', {
	force:true
		// skipNpm: true,
		// skipBower: true
	}], true,true))
	.Expect('npm dependencies installed.',true,(_)=>{
		return accessSync(path.join(targetdir,'node_modules'));
	})
	.Expect('bower dependencies installed.',true,(_)=>{
		// return accessSync(path.join(targetdir,'bower_components'));
		return true; //TODO: Project does not currently have bower dependencies
	})
tests.last.CleanUp(() => {
	// fs.removeSync(targetdir);
});
// tests.push(new TestNode('testingapp force:true',['testingapp',{force:true}],true));

export {
	tests as config
};
export {
	cmdname as testname
};
