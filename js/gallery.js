import {$, ready} from './std-js/functions.js';

ready().then(() => {
	$('.gallery').each(gallery => {
		$('.thumbnails picture:first-of-type').addClass('current-thumb');
		$('.thumbnails picture', gallery).click(event => {
			const clicked = event.target.closest('.thumbnails picture');
			const current = gallery.querySelector('.current').parentElement;
			console.log({clicked, current});
			const thumbnails = clicked.closest('.thumbnails');
			$('picture', thumbnails).forEach(thumbnail => {
				thumbnail.classList.toggle('current-thumb', thumbnail === clicked);
			});
			const clone = clicked.cloneNode(true);
			const sizes = current.querySelector('source').sizes;
			$('source', clone).forEach(source => source.sizes = sizes);
			clone.querySelector('img').className = current.querySelector('img').className;
			current.replaceWith(clone);
		});
	});
});
