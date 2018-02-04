import './std-js/deprefixer.js';
import './std-js/shims.js';
import {$, ready, loaded, registerServiceWorker, imgur} from './std-js/functions.js';
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

	$('[data-menuitem]').click(async event => {
		const target = event.target.closest('[data-menuitem]');
		const menuitem = JSON.parse(target.dataset.menuitem);
		const template = document.getElementById('menuitem').content.cloneNode(true);
		const dialog = document.createElement('dialog');
		const header = document.createElement('header');
		const close = document.createElement('button');
		const picture = target.querySelector('[data-imgur]');
		close.textContent = 'X';
		close.classList.add('float-right');
		header.classList.add('clearfix', 'background-primary', 'shadow', 'sticky', 'top');
		close.type = 'button';
		header.append(close);
		dialog.append(header);

		close.addEventListener('click', event => event.target.closest('dialog[open]').close());
		dialog.addEventListener('close', event => event.target.remove());

		$('[data-menu-field]', template).forEach(field => {
			if (menuitem.hasOwnProperty(field.dataset.menuField)) {
				field.textContent = menuitem[field.dataset.menuField];
			} else {
				field.remove();
			}
		});

		const img = await imgur(picture.dataset.imgur, {
			sizes: ['75vw'],
			defaultSize: 'l',
		});
		img.lastElementChild.classList.add('card');
		template.append(img);

		dialog.append(template);
		document.body.append(dialog);
		dialog.showModal();
	});

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
