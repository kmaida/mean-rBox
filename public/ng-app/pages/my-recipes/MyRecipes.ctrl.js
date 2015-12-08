(function() {
	'use strict';

	angular
		.module('rBox')
		.controller('MyRecipesCtrl', MyRecipesCtrl);

	MyRecipesCtrl.$inject = ['Page', 'Utils', 'recipeData', 'userData', '$location', '$scope'];

	function MyRecipesCtrl(Page, Utils, recipeData, userData, $location, $scope) {
		// controllerAs ViewModel
		var myRecipes = this;

		// private variables
		var _tab = $location.search().view;

		// bindable members
		myRecipes.tabs = [
			{
				query: 'recipe-box'
			},
			{
				query: 'filed-recipes'
			},
			{
				query: 'new-recipe'
			}
		];
		myRecipes.currentTab = _tab ? _tab : 'recipe-box';
		myRecipes.changeTab = changeTab;
		myRecipes.isAuthenticated = Utils.isAuthenticated;

		_init();

		/**
		 * INIT
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('My Recipes');

			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);

			_activate();
		}

		/**
		 * ACTIVATE
		 *
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			userData.getUser().then(_getUserSuccess);
			recipeData.getMyRecipes().then(_recipesSuccess, _recipesError);
		}

		/**
		 * Enter mobile - set shorter tab names
		 *
		 * @private
		 */
		function _enterMobile() {
			myRecipes.tabs[0].name = 'Recipe Box';
			myRecipes.tabs[1].name = 'Filed';
			myRecipes.tabs[2].name = 'New Recipe';
		}

		/**
		 * Exit mobile - set longer tab names
		 *
		 * @private
		 */
		function _exitMobile() {
			myRecipes.tabs[0].name = 'My Recipe Box';
			myRecipes.tabs[1].name = 'Filed Recipes';
			myRecipes.tabs[2].name = 'Add New Recipe';
		}

		/**
		 * Change tab
		 *
		 * @param query {string} tab to switch to
		 */
		function changeTab(query) {
			$location.search('view', query);
			myRecipes.currentTab = query;
		}

		/**
		 * Successful promise getting user's data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _getUserSuccess(data) {
			var savedRecipesObj = {savedRecipes: data.savedRecipes};
			myRecipes.user = data;

			recipeData.getFiledRecipes(savedRecipesObj).then(_filedSuccess);
		}

		/**
		 * Successful promise returning user's saved recipes
		 *
		 * @param recipes {promise}.data
		 * @private
		 */
		function _filedSuccess(recipes) {
			myRecipes.filedRecipes = recipes;
		}

		/**
		 * Successful promise returning user's recipe data
		 *
		 * @param data {promise}.data
		 * @private
		 */
		function _recipesSuccess(data) {
			myRecipes.recipes = data;

			$scope.$emit('loading-off');
		}

		/**
		 * Error returning user's recipe data
		 *
		 * @param error {object}
		 * @private
		 */
		function _recipesError(error) {
			console.log('Error loading recipes', error);
			$scope.$emit('loading-off');
		}
	}
}());