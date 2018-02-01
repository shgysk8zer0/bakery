import './std-js/deprefixer.js';
import './std-js/shims.js';
import {$, ready, loaded, registerServiceWorker} from './std-js/functions.js';
import * as Mutations from './std-js/mutations.js';
import {supportsAsClasses} from './std-js/supports.js';
import webShareApi from './std-js/webShareApi.js';
import './gallery.js';
import {
	facebook,
	twitter,
	googlePlus,
	linkedIn,
	reddit,
	gmail,
	email,
} from './std-js/share-config.js';

function hashChangeHandler(event) {
	if (event.oldURL) {
		const oldURL = new URL(event.oldURL);
		if (location.pathname === oldURL.pathname && oldURL.hash.startsWith('#')) {
			const oldTarget = document.getElementById(oldURL.hash.substr(1));
			if (oldTarget instanceof Element && oldTarget.tagName === 'DIALOG') {
				oldTarget.close();
			}
		}
	}

	if (event.newURL) {
		if (location.hash.length !== 0) {
			const target = document.querySelector('dialog:target');
			if (target instanceof Element) {
				target.showModal();
			}
		}
	}
}

webShareApi(facebook, twitter, googlePlus, linkedIn, reddit, gmail, email);

loaded().then(() => $('.animation-paused').removeClass('animation-paused'));

ready().then(async () => {
	window.addEventListener('hashchange', hashChangeHandler);

	if (location.hash.length !== 0) {
		const target = document.querySelector('dialog:target');
		if (target instanceof Element) {
			target.showModal();
		}
	}

	const $doc = $(document.documentElement);
	$('[data-service-worker]').each(el => registerServiceWorker(el.dataset.serviceWorker));

	if (Navigator.prototype.hasOwnProperty('share')) {
		$('[data-share]').attr({hidden: false});
	}

	$doc.replaceClass('no-js', 'js');
	$doc.toggleClass('offline', ! navigator.onLine);
	$doc.watch(Mutations.events, Mutations.options, Mutations.filter);
	$doc.keypress(event => event.key === 'Escape' && $('dialog[open]').close());
	Mutations.init();

	$('[data-open]').click(event => {
		event.preventDefault();
		const url = new URL(event.target.dataset.open, location.origin);
		window.open(url);
	});

	$('dialog').on('close', event => {
		const target = document.querySelector(':target');
		if (event.target === target) {
			if (history.length !== 1) {
				history.back();
			} else {
				location.hash = '';
			}
		}
	});

	// $('[data-click="fullscreen"]').click(event => event.target.closest('.gallery').requestFullScreen());
	$(document.forms).submit(event => {
		event.preventDefault();
		const body = new FormData(event.target);
		const url = new URL(event.target.action, document.baseURI);
		body.delete('filter');
		fetch(url, {body, method: 'POST'});
		event.target.closest('dialog').close();
	});

	supportsAsClasses(...document.documentElement.dataset.supportTest.split(',').map(test => test.trim()));
});
