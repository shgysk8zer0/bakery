import {$, ready, loaded} from './std-js/functions.js';

ready().then(async () => {
	$(document.documentElement).replaceClass('no-js', 'js');
});

loaded().then(() => $('.animation-paused').removeClass('animation-paused'));
