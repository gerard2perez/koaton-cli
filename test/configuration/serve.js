import {
	sync as spawn
} from 'cross-spawn';
import {
	sync as glob
} from 'glob';
import * as path from 'upath';
import * as fs from 'fs-extra';
import TestNode from '../support/TestNode';
import '../support/array';
import ServerConfiguaration from '../../src/support/Server';

let tests = [];
let cmdname = 'koaton serve';

tests.push(new TestNode(cmdname, [undefined, {
		H: true
	}], true, true))
	.Expect('Renders help', true, (log) => {
		return log.indexOf(cmdname) > -1;
	});

tests.push(new TestNode('(no args)', [{}], true))
	.SetUp(() => {
		process.chdir('testingapp');
		process.env.isproyect = 'true';
		global.scfg = new ServerConfiguaration();
		scfg.env = 'development';
        setTimeout(()=>{
            process.kill(0);
        },1000*60*1)
	});


export {
	tests as config,
	cmdname as testname
};
