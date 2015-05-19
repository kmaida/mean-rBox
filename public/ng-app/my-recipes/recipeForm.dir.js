(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', 'Slug', '$location', '$timeout'];

	function recipeForm(recipeData, Slug, $location, $timeout) {

		function recipeFormCtrl() {
			var rf = this;
			var _isEdit = !!rf.recipe;

			if (_isEdit) {
				rf.recipeData = rf.recipe;
			} else {
				rf.recipeData = {};
				rf.recipeData.userId = rf.userId;
			}

			/**
			 * Recipe created or saved successfully
			 *
			 * @param recipe {data} if editing event
			 * @private
			 */
			function _recipeSaved(recipe) {
				console.log('saved');

				if (!_isEdit) {
					var recipeId = recipe._id;

					console.log('new recipe ID:', recipeId);
				}
			}

			/**
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				rf.recipeData.slug = Slug.slugify(rf.recipeData.name);

				if (!_isEdit) {
					recipeData.createRecipe(rf.recipeData).then(_recipeSaved);
				} else {
					recipeData.updateRecipe(rf.recipe._id, rf.recipeData).then(_recipeSaved);
				}
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