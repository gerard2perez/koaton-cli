import * as notifier from 'node-notifier';
import { sync as glob } from 'glob';

let icons = glob('public/*.ico');
let icon;
if (icons.length === 0) {
	icon = TemplatePath('public', 'koaton.ico');
} else {
	icon = ProyPath(icons[0]);
}

export default function (title, message, sound = 'Hero') {
	notifier.notify({
		title: title,
		message: message,
		icon: icon,
		sound: sound,
		wait: false
	});
}
