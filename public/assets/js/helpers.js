'use strict';

window.helpers = (function() {

	init();

	/**
	 * Initialize public window.helpers functions
	 */
	function init() {
		fixBrowsers();
	}

	/**
	 * Fix browser weirdness
	 * Correct Modernizr bugs
	 */
	function fixBrowsers() {
		var ua = navigator.userAgent.toLowerCase(),
			chrome = ua.lastIndexOf('chrome/') > 0,
			safari = ua.lastIndexOf('safari') > 0,
			$html = $('html');
		
		// Modernizr 2 bug: Chrome on Windows 8 gives a false negative for transforms3d support
		// Google does not plan to fix this; https://code.google.com/p/chromium/issues/detail?id=129004
		// Safari bug: Safari also gives false negative (seems site-specific)
		if (chrome || safari) {
			var chromeversion = ua.substr(ua.lastIndexOf('chrome/') + 7, 2);

			if ((chromeversion >= 12 || safari) && $html.hasClass('no-csstransforms3d')) {
				$html
					.removeClass('no-csstransforms3d')
					.addClass('csstransforms3d');
			}
		}
	}
})();