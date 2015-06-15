// For touchend/mouseup blur
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('blurOnEnd', blurOnEnd);

	blurOnEnd.$inject = [];

	function blurOnEnd() {

		blurOnEndLink.$inject = ['$scope', '$elem'];

		function blurOnEndLink($scope, $elem) {
			$elem.bind('touchend', blurElem);
			$elem.bind('mouseup', blurElem);

			function blurElem() {
				$elem.trigger('blur');
			}

			$scope.$on('$destroy', function() {
				$elem.unbind('touchend', blurElem);
				$elem.unbind('mouseup', blurElem)
			});
		}

		return {
			restrict: 'EA',
			link: blurOnEndLink
		};
	}
})();