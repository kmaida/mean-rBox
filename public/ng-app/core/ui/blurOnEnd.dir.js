// For touchend/mouseup blur
(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('blurOnEnd', blurOnEnd);

	function blurOnEnd() {
		// return directive
		return {
			restrict: 'EA',
			link: blurOnEndLink
		};

		/**
		 * blurOnEnd LINK function
		 *
		 * @param $scope
		 * @param $elem
		 */
		function blurOnEndLink($scope, $elem) {
			_init();

			/**
			 * INIT
			 *
			 * @private
			 */
			function _init() {
				$elem.bind('touchend', _blurElem);
				$elem.bind('mouseup', _blurElem);

				$scope.$on('$destroy', _onDestroy);
			}

			/**
			 * Fire blur event
			 *
			 * @private
			 */
			function _blurElem() {
				$elem.trigger('blur');
			}

			/**
			 * On $destroy, unbind handlers
			 *
			 * @private
			 */
			function _onDestroy() {
				$elem.unbind('touchend', _blurElem);
				$elem.unbind('mouseup', _blurElem);
			}
		}
	}
}());