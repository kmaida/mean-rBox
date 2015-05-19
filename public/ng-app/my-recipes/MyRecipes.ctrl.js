(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('MyRecipesCtrl', MyRecipesCtrl);

	MyRecipesCtrl.$inject = ['$auth', 'recipeData', 'userData'];

	function MyRecipesCtrl($auth, recipeData, userData) {
		// controllerAs ViewModel
		var myRecipes = this;

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		myRecipes.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		function _getUserSuccess(data) {
			myRecipes.user = data;
		}
		userData.getUser().then(_getUserSuccess);

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data
		 * @private
		 */
		function _recipesSuccess(data) {
			console.log('recipes:', data);
			myRecipes.recipes = data;
		}
		recipeData.getMyRecipes().then(_recipesSuccess);
	}
})();