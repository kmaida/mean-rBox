(function() {
	'use strict';

	angular
		.module('rBox')
		.factory('Recipe', Recipe);

	function Recipe() {
		var dietary = [
			'Vegetarian',
			'Vegan',
			'Gluten-free'
		];

		var insertChar = [
			'⅛',
			'¼',
			'⅓',
			'½',
			'⅔',
			'¾'
		];

		var categories = [
			'appetizer',
			'soup',
			'salad',
			'side',
			'entree',
			'dessert',
			'beverage'
		];

		var tags = [
			'beef',
			'fish',
			'pasta',
			'poultry',
			'pork',
			'vegetable',
			'one-pot',
			'fast',
			'slow-cook',
			'stock',
			'baked',
			'low-calorie',
			'alcohol'
		];

		return {
			dietary: dietary,
			insertChar: insertChar,
			categories: categories,
			tags: tags
		}
	}
})();