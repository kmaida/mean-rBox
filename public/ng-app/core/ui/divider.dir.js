(function() {

	angular
		.module('rBox')
		.directive('divider', divider);

	function divider() {
		// return directive
		return {
			restrict: 'EA',
			template: '<div class="rBox-divider"><i class="fa fa-cutlery"></i></div>'
		};
	}

}());