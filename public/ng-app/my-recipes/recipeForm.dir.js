(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData'];

	function recipeForm(recipeData) {

		recipeFormCtrl.$inject = ['$scope'];

		function recipeFormCtrl($scope) {
			var rf = this;
			var _isCreate = !!rf.recipe;

			rf.recipeData = {};
			rf.recipeData.userId = rf.userId;

			/**
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				//if (_isCreate) {
					recipeData.createRecipe(rf.recipeData).then();
				//} else {
					//recipeData.saveRecipe(rf.recipe._id, rf.recipeData).then();
				//}
			};
		}

		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/my-recipes/recipeForm.tpl.html',
			controller: recipeFormCtrl,
			controllerAs: 'rf',
			bindToController: true
		}
	}
})();