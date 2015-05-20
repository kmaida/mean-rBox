(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Recipe', Recipe);

	function Recipe() {
		var dietary = [
			'vegetarian',
			'vegan',
			'gluten-free'
		];

		var insertChar = [
			'¼',
			'½',
			'¾',
			'º'
		];

		return {
			dietary: dietary,
			insertChar: insertChar
		}
	}
})();