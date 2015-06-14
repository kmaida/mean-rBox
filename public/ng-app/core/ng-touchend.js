// For events based on viewport size - updates as viewport is resized
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('ngTouchend', ngTouchend);

	ngTouchend.$inject = [];

	function ngTouchend() {

		ngTouchendLink.$inject = ['$scope', '$elem', '$attrs'];

		/**
		 * ngTouchend directive link function
		 *
		 * @param $scope
		 */
		function ngTouchendLink($scope, $elem, $attrs) {
			$elem.bind('touchend', onTouchEnd);

			function onTouchEnd() {
				var method = $elem.attr('ng-touchend');

				$scope.$apply(function() {
					$scope.$eval(method);
				});
			}
		}

		return {
			restrict: 'A',
			link: ngTouchendLink
		};
	}
})();