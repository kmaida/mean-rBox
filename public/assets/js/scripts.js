'use strict';

window.helpers = (function() {

	init();

	/**
	 * Initialize public window.helpers functions
	 */
	function init() {
		fixBrowsers();

		Array.prototype.move = function(old_index, new_index) {
			var k;

			if (new_index >= this.length) {
				k = new_index - this.length;
				while ((k--) + 1) {
					this.push(undefined);
				}
			}
			this.splice(new_index, 0, this.splice(old_index, 1)[0]);
		};
	}

	/**
	 * Fix browser weirdness
	 * Correct Modernizr bugs
	 */
	function fixBrowsers() {
		var ua = navigator.userAgent.toLowerCase();
		var chrome = ua.lastIndexOf('chrome/') > 0;
		var chromeversion = null;
		var safari = ua.lastIndexOf('safari') > 0;
		var $html = $('html');

		// Modernizr 2 bug: Chrome on Windows 8 gives a false negative for transforms3d support
		// Google does not plan to fix this; https://code.google.com/p/chromium/issues/detail?id=129004
		// Safari bug: Safari also gives false negative (seems site-specific)
		if (chrome || safari) {
			chromeversion = ua.substr(ua.lastIndexOf('chrome/') + 7, 2);

			if ((chromeversion >= 12 || safari) && $html.hasClass('no-csstransforms3d')) {
				$html
					.removeClass('no-csstransforms3d')
					.addClass('csstransforms3d');
			}
		}
	}

}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcblxyXG53aW5kb3cuaGVscGVycyA9IChmdW5jdGlvbigpIHtcclxuXHJcblx0aW5pdCgpO1xyXG5cclxuXHQvKipcclxuXHQgKiBJbml0aWFsaXplIHB1YmxpYyB3aW5kb3cuaGVscGVycyBmdW5jdGlvbnNcclxuXHQgKi9cclxuXHRmdW5jdGlvbiBpbml0KCkge1xyXG5cdFx0Zml4QnJvd3NlcnMoKTtcclxuXHJcblx0XHRBcnJheS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKG9sZF9pbmRleCwgbmV3X2luZGV4KSB7XHJcblx0XHRcdHZhciBrO1xyXG5cclxuXHRcdFx0aWYgKG5ld19pbmRleCA+PSB0aGlzLmxlbmd0aCkge1xyXG5cdFx0XHRcdGsgPSBuZXdfaW5kZXggLSB0aGlzLmxlbmd0aDtcclxuXHRcdFx0XHR3aGlsZSAoKGstLSkgKyAxKSB7XHJcblx0XHRcdFx0XHR0aGlzLnB1c2godW5kZWZpbmVkKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5zcGxpY2UobmV3X2luZGV4LCAwLCB0aGlzLnNwbGljZShvbGRfaW5kZXgsIDEpWzBdKTtcclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBGaXggYnJvd3NlciB3ZWlyZG5lc3NcclxuXHQgKiBDb3JyZWN0IE1vZGVybml6ciBidWdzXHJcblx0ICovXHJcblx0ZnVuY3Rpb24gZml4QnJvd3NlcnMoKSB7XHJcblx0XHR2YXIgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XHJcblx0XHR2YXIgY2hyb21lID0gdWEubGFzdEluZGV4T2YoJ2Nocm9tZS8nKSA+IDA7XHJcblx0XHR2YXIgY2hyb21ldmVyc2lvbiA9IG51bGw7XHJcblx0XHR2YXIgc2FmYXJpID0gdWEubGFzdEluZGV4T2YoJ3NhZmFyaScpID4gMDtcclxuXHRcdHZhciAkaHRtbCA9ICQoJ2h0bWwnKTtcclxuXHJcblx0XHQvLyBNb2Rlcm5penIgMiBidWc6IENocm9tZSBvbiBXaW5kb3dzIDggZ2l2ZXMgYSBmYWxzZSBuZWdhdGl2ZSBmb3IgdHJhbnNmb3JtczNkIHN1cHBvcnRcclxuXHRcdC8vIEdvb2dsZSBkb2VzIG5vdCBwbGFuIHRvIGZpeCB0aGlzOyBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTI5MDA0XHJcblx0XHQvLyBTYWZhcmkgYnVnOiBTYWZhcmkgYWxzbyBnaXZlcyBmYWxzZSBuZWdhdGl2ZSAoc2VlbXMgc2l0ZS1zcGVjaWZpYylcclxuXHRcdGlmIChjaHJvbWUgfHwgc2FmYXJpKSB7XHJcblx0XHRcdGNocm9tZXZlcnNpb24gPSB1YS5zdWJzdHIodWEubGFzdEluZGV4T2YoJ2Nocm9tZS8nKSArIDcsIDIpO1xyXG5cclxuXHRcdFx0aWYgKChjaHJvbWV2ZXJzaW9uID49IDEyIHx8IHNhZmFyaSkgJiYgJGh0bWwuaGFzQ2xhc3MoJ25vLWNzc3RyYW5zZm9ybXMzZCcpKSB7XHJcblx0XHRcdFx0JGh0bWxcclxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbm8tY3NzdHJhbnNmb3JtczNkJylcclxuXHRcdFx0XHRcdC5hZGRDbGFzcygnY3NzdHJhbnNmb3JtczNkJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG59KCkpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
