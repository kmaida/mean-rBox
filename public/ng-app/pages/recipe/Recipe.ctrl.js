(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('RecipeCtrl', RecipeCtrl);

	RecipeCtrl.$inject = ['$scope', 'Page', 'Utils', '$routeParams', 'recipeData', 'userData'];

	function RecipeCtrl($scope, Page, Utils, $routeParams, recipeData, userData) {
		// controllerAs ViewModel
		var recipe = this;

		// private variables
		var recipeSlug = $routeParams.slug;

		// bindable members
		recipe.ingChecked = [];
		recipe.stepChecked = [];
		recipe.toggleCheck = toggleCheck;
		recipe.fileRecipe = fileRecipe;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Recipe');

			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			if (Utils.isAuthenticated()) {
				userData.getUser().then(_getUserSuccess);
			}

			recipeData.getRecipe(recipeSlug).then(_recipeSuccess, _recipeError);
		}

		/**
		 * Successful promise returning user's data
		 *
		 * @param data {object} user info
		 * @private
		 */
		function _getUserSuccess(data) {
			recipe.user = data;

			// logged in users can file recipes
			recipe.fileText = 'File this recipe';
			recipe.unfileText = 'Remove from Filed Recipes';
		}

		/**
		 * Successful promise returning recipe data
		 *
		 * @param data {promise} recipe data
		 * @private
		 */
		function _recipeSuccess(data) {
			recipe.recipe = data;
			Page.setTitle(recipe.recipe.name);

			userData.getAuthor(recipe.recipe.userId).then(_authorSuccess);

			_createCheckedArrays(recipe.ingChecked, recipe.recipe.ingredients);
			_createCheckedArrays(recipe.stepChecked, recipe.recipe.directions);

			$scope.$emit('loading-off');
		}

		/**
		 * Create array to keep track of checked / unchecked items
		 *
		 * @param checkedArr
		 * @param sourceArr
		 * @private
		 */
		function _createCheckedArrays(checkedArr, sourceArr) {
			var i;

			for (i = 0; i < sourceArr.length; i++) {
				checkedArr[i] = false;
			}
		}

		/**
		 * Error retrieving recipe
		 *
		 * @param res {promise}
		 * @private
		 */
		function _recipeError(res) {
			recipe.recipe = 'error';
			Page.setTitle('Error');
			recipe.errorMsg = res.data.message;

			$scope.$emit('loading-off');
		}

		/**
		 * Toggle checkmark
		 *
		 * @param type
		 * @param index
		 */
		function toggleCheck(type, index) {
			recipe[type + 'Checked'][index] = !recipe[type + 'Checked'][index];
		}

		/**
		 * Successful promise returning author data
		 *
		 * @param data {promise} author picture, displayName
		 * @private
		 */
		function _authorSuccess(data) {
			recipe.author = data;
		}

		/**
		 * File or unfile this recipe
		 *
		 * @param recipeId {string} ID of recipe to save
		 * @returns {promise}
		 */
		function fileRecipe(recipeId) {
			return recipeData.fileRecipe(recipeId).then(_fileSuccess, _fileError);
		}

		/**
		 * Successful promise from saving recipe to user data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _fileSuccess(data) {
			console.log(data.message);
			recipe.apiMsg = data.added ? 'Recipe saved!' : 'Recipe removed!';
			recipe.filed = data.added;
		}

		/**
		 * Error promise from saving recipe to user data
		 *
		 * @param response {promise}
		 * @private
		 */
		function _fileError(response) {
			console.log(response.data.message);
		}
	}
}());