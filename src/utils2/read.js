import * as Promise from 'bluebird';
import {
	readFile
} from 'fs-extra';

export default Promise.promisify(readFile);
