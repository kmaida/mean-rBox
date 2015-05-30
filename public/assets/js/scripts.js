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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbndpbmRvdy5oZWxwZXJzID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuXHRpbml0KCk7XHJcblxyXG5cdC8qKlxyXG5cdCAqIEluaXRpYWxpemUgcHVibGljIHdpbmRvdy5oZWxwZXJzIGZ1bmN0aW9uc1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGluaXQoKSB7XHJcblx0XHRmaXhCcm93c2VycygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogRml4IGJyb3dzZXIgd2VpcmRuZXNzXHJcblx0ICogQ29ycmVjdCBNb2Rlcm5penIgYnVnc1xyXG5cdCAqL1xyXG5cdGZ1bmN0aW9uIGZpeEJyb3dzZXJzKCkge1xyXG5cdFx0dmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLFxyXG5cdFx0XHRjaHJvbWUgPSB1YS5sYXN0SW5kZXhPZignY2hyb21lLycpID4gMCxcclxuXHRcdFx0c2FmYXJpID0gdWEubGFzdEluZGV4T2YoJ3NhZmFyaScpID4gMCxcclxuXHRcdFx0JGh0bWwgPSAkKCdodG1sJyk7XHJcblx0XHRcclxuXHRcdC8vIE1vZGVybml6ciAyIGJ1ZzogQ2hyb21lIG9uIFdpbmRvd3MgOCBnaXZlcyBhIGZhbHNlIG5lZ2F0aXZlIGZvciB0cmFuc2Zvcm1zM2Qgc3VwcG9ydFxyXG5cdFx0Ly8gR29vZ2xlIGRvZXMgbm90IHBsYW4gdG8gZml4IHRoaXM7IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xMjkwMDRcclxuXHRcdC8vIFNhZmFyaSBidWc6IFNhZmFyaSBhbHNvIGdpdmVzIGZhbHNlIG5lZ2F0aXZlIChzZWVtcyBzaXRlLXNwZWNpZmljKVxyXG5cdFx0aWYgKGNocm9tZSB8fCBzYWZhcmkpIHtcclxuXHRcdFx0dmFyIGNocm9tZXZlcnNpb24gPSB1YS5zdWJzdHIodWEubGFzdEluZGV4T2YoJ2Nocm9tZS8nKSArIDcsIDIpO1xyXG5cclxuXHRcdFx0aWYgKChjaHJvbWV2ZXJzaW9uID49IDEyIHx8IHNhZmFyaSkgJiYgJGh0bWwuaGFzQ2xhc3MoJ25vLWNzc3RyYW5zZm9ybXMzZCcpKSB7XHJcblx0XHRcdFx0JGh0bWxcclxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbm8tY3NzdHJhbnNmb3JtczNkJylcclxuXHRcdFx0XHRcdC5hZGRDbGFzcygnY3NzdHJhbnNmb3JtczNkJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9