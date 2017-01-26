import { sync as glob } from 'glob';

const hasChanged = function (oldbranch, newbranch) {
		if (oldbranch === undefined || newbranch === undefined) {
			return true;
		}
		for (const file of newbranch) {
			if (!oldbranch.content.indexOf(file) === -1) {
				return true;
			}
		}
		for (const file of oldbranch) {
			if (newbranch.content.indexOf(file) === -1) {
				return true;
			}
		}
		return false;
	},
	findDiferences = function findDiferences (source, target) {
		let diff = [];
		for (const file in source) {
			if (target.indexOf(source[file]) === -1) {
				diff = diff.concat(glob(source[file]));
			}
		}
		return diff;
	},
	getDiferences = function (...args) {
		let [oldbranch, newbranch] = args;
		let isnew = oldbranch === undefined;
		let deleted = newbranch === undefined;
		oldbranch = oldbranch || {content: []};
		newbranch = newbranch || {content: []};
		let added = findDiferences(newbranch.content, oldbranch.content),
			removed = findDiferences(oldbranch.content, newbranch.content);
		return {
			deleted: deleted,
			isnew: isnew,
			added: added.filter((file) => {
				return removed.indexOf(file) === -1;
			}),
			removed: removed.filter((file) => {
				return added.indexOf(file) === -1;
			})
		};
	};

export { hasChanged, findDiferences, getDiferences };
