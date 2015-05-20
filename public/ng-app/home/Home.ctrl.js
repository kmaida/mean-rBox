(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['localData', 'recipeData'];

	function HomeCtrl(localData, recipeData) {
		// controllerAs ViewModel
		var home = this;

		/**
		 * Get local data from static JSON
		 *
		 * @param data (successful promise returns)
		 * @returns {object} data
		 */
		function _localDataSuccess(data) {
			home.localData = data;
		}
		localData.getJSON().then(_localDataSuccess);

		function _publicRecipesSuccess(data) {
			home.publicRecipes = data;
		}
		recipeData.getPublicRecipes().then(_publicRecipesSuccess);
	}
})();