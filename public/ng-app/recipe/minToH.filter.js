(function() {
	'use strict';

	angular
		.module('rBox')
		.filter('minToH', minToH);

	function minToH() {
		return function(min) {
			var _hour = 60;
			var _gtHour = min / _hour >= 1;
			var timeStr = null;

			if (_gtHour) {
				var hPlusMin = min % _hour;
				var _hasMinutes = hPlusMin !== 0;
				var hours = Math.floor(min / _hour);
				var minutes = _hasMinutes ? ', ' + hPlusMin + ' minutes' : '';

				timeStr = hours + ' hours' + minutes;
			} else {
				timeStr = min + ' minutes';
			}

			return timeStr;
		};
	}
})();