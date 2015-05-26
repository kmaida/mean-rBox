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
			'Appetizer',
			'Soup',
			'Salad',
			'Side dish',
			'Main course',
			'Dessert',
			'Beverage'
		];

		var tags = [
			'poultry',
			'beef',
			'pork',
			'fish',
			'pasta',
			'one-pot',
			'fast'
		];

		return {
			dietary: dietary,
			insertChar: insertChar,
			categories: categories,
			tags: tags
		}
	}
})();