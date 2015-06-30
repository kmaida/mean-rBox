(function() {
	'use strict';

	angular
		.module('rBox')
		.directive('recipeForm', recipeForm);

	recipeForm.$inject = ['recipeData', 'Recipe', 'Slug', '$location', '$timeout', 'Upload'];

	function recipeForm(recipeData, Recipe, Slug, $location, $timeout, Upload) {

		function recipeFormCtrl() {
			var rf = this;
			var _isEdit = !!rf.recipe;
			var _originalSlug = _isEdit ? rf.recipe.slug : null;

			rf.recipeData = _isEdit ? rf.recipe : {};
			rf.recipeData.userId = _isEdit ? rf.recipe.userId : rf.userId;
			rf.recipeData.photo = _isEdit ? rf.recipe.photo : null;
			rf.recipeData.ingredients = _isEdit ? rf.recipe.ingredients : [{id: 1}];
			rf.recipeData.directions = _isEdit ? rf.recipe.directions : [{id: 1}];
			rf.recipeData.tags = _isEdit ? rf.recipeData.tags : [];

			rf.timeRegex = /^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/;
			rf.timeError = 'Please enter a number in minutes. Multiply hours by 60.';

			// fetch categories options list
			rf.categories = Recipe.categories;

			// fetch tags options list
			rf.tags = Recipe.tags;

			// fetch dietary options list
			rf.dietary = Recipe.dietary;

			// fetch special characters
			rf.chars = Recipe.insertChar;

			// setup special characters private vars
			var _lastInput;
			var _ingIndex;
			var _caretPos;

			/**
			 * Set selection range
			 *
			 * @param input
			 * @param selectionStart {number}
			 * @param selectionEnd {number}
			 * @private
			 */
			function _setSelectionRange(input, selectionStart, selectionEnd) {
				if (input.setSelectionRange) {
					input.click();
					input.focus();
					input.setSelectionRange(selectionStart, selectionEnd);
				}
				else if (input.createTextRange) {
					var range = input.createTextRange();
					range.collapse(true);
					range.moveEnd('character', selectionEnd);
					range.moveStart('character', selectionStart);
					range.select();
				}
			}

			/**
			 * Set caret position
			 *
			 * @param input
			 * @param pos {number} intended caret position
			 * @private
			 */
			function _setCaretToPos(input, pos) {
				_setSelectionRange(input, pos, pos);
			}

			/**
			 * Keep track of caret position in ingredient amount text field
			 *
			 * @param $event {object}
			 * @param index {number}
			 */
			rf.insertCharInput = function($event, index) {
				$timeout(function() {
					_ingIndex = index;
					_lastInput = angular.element('#' + $event.target.id);
					_caretPos = _lastInput[0].selectionStart;
				});
			};

			/**
			 * Insert character at last caret position
			 * In supported field
			 *
			 * @param char {string} special character
			 */
			rf.insertChar = function(char) {
				if (_lastInput) {
					var _textVal = rf.recipeData.ingredients[_ingIndex].amt === undefined ? '' : rf.recipeData.ingredients[_ingIndex].amt;

					rf.recipeData.ingredients[_ingIndex].amt = _textVal.substring(0, _caretPos) + char + _textVal.substring(_caretPos);

					$timeout(function() {
						_caretPos = _caretPos + 1;
						_setCaretToPos(_lastInput[0], _caretPos);
					});
				}
			};

			/**
			 * Clear caret position and last input
			 * So that special characters don't end up in undesired fields
			 */
			rf.clearChar = function() {
				_ingIndex = null;
				_lastInput = null;
				_caretPos = null;
			};

			var _extraUploads = [];

			/**
			 * Upload image file
			 *
			 * @param files {Array} array of files to upload
			 */
			rf.upload = function(files) {
				if (files && files.length) {
					var file = files[0];    // only single upload allowed

					Upload
						.upload({
							url: '/api/recipe/upload',
							file: file
						})
						.progress(function(evt) {
							var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
							rf.uploadError = false;
							rf.uploadInProgress = true;
							rf.uploadProgress = progressPercentage + '% ' + evt.config.file.name;
						})
						.success(function (data, status, headers, config) {
							$timeout(function() {
								rf.uploadInProgress = false;
								rf.recipeData.photo = data.filename;

								_extraUploads.push(data.filename);

								console.log(data);
							});
						})
						.error(function(err) {
							rf.uploadInProgress = false;
							rf.uploadError = true;
							rf.uploadErrorMsg = err.message || err;
							console.log('Error uploading file:', err.message || err);
						});
				}
			};

			/**
			 * Remove uploaded photo from front-end
			 * (won't be cleaned up on filesystem until save)
			 */
			rf.removePhoto = function() {
				rf.recipeData.photo = null;
				angular.element('#recipePhoto').val('');
			};

			// create map of touched tags
			rf.tagMap = {};
			if (_isEdit && rf.recipeData.tags.length) {
				angular.forEach(rf.recipeData.tags, function(tag, i) {
					rf.tagMap[tag] = true;
				});
			}

			/**
			 * Add / remove tag
			 *
			 * @param tag {string} tag name
			 */
			rf.addRemoveTag = function(tag) {
				var _activeTagIndex = rf.recipeData.tags.indexOf(tag);

				if (_activeTagIndex > -1) {
					// tag exists in model, turn it off
					rf.recipeData.tags.splice(_activeTagIndex, 1);
					rf.tagMap[tag] = false;
				} else {
					// tag does not exist in model, turn it on
					rf.recipeData.tags.push(tag);
					rf.tagMap[tag] = true;
				}
			};

			/**
			 * Clean empty items out of array before saving
			 * Ingredients or Directions
			 *
			 * @param modelName {string} ingredients / directions
			 * @private
			 */
			function _cleanEmpties(modelName) {
				var _array = rf.recipeData[modelName];
				var _check = modelName === 'ingredients' ? 'ingredient' : 'step';

				angular.forEach(_array, function(obj, i) {
					if (!!obj[_check] === false) {
						_array.splice(i, 1);
					}
				});
			}

			/**
			 * Reset save button
			 *
			 * @private
			 */
			function _resetSaveBtn() {
				rf.saved = false;
				rf.saveBtnText = _isEdit ? 'Update Recipe' : 'Save Recipe';
			}

			_resetSaveBtn();

			/**
			 * Recipe created or saved successfully
			 *
			 * @param recipe {promise} if editing event
			 * @private
			 */
			function _recipeSaved(recipe) {
				rf.saved = true;
				rf.saveBtnText = _isEdit ? 'Updated!' : 'Saved!';

				/**
				 * Go to new slug (if new) or updated slug (if slug changed)
				 *
				 * @private
				 */
				function _goToNewSlug() {
					var _path = !_isEdit ? recipe.slug : rf.recipeData.slug + '/edit';

					$location.path('/recipe/' + _path);
				}

				if (!_isEdit || _isEdit && _originalSlug !== rf.recipeData.slug) {
					$timeout(_goToNewSlug, 1000);
				} else {
					$timeout(_resetSaveBtn, 2000);
				}
			}

			/**
			 * Recipe not saved / created due to error
			 *
			 * @param err {promise}
			 * @private
			 */
			function _recipeSaveError(err) {
				rf.saveBtnText = 'Error saving!';
				rf.saved = 'error';
				$timeout(_resetSaveBtn, 4000);
			}

			/**
			 * Save recipe
			 */
			rf.saveRecipe = function() {
				rf.saveBtnText = _isEdit ? 'Updating...' : 'Saving...';

				// prep data for saving
				rf.recipeData.slug = Slug.slugify(rf.recipeData.name);
				_cleanEmpties('ingredients');
				_cleanEmpties('directions');

				if (rf.recipeData.photo && _extraUploads && _extraUploads.length > 1) {
					var _keepIndex = _extraUploads.indexOf(rf.recipeData.photo);

					_extraUploads.splice(_keepIndex);

					if (_extraUploads.length) {
						recipeData.cleanUploads(_extraUploads)
							.then(function() {
								console.log('cleaned extra uploads!');
							});
					}
				}

				// save!
				if (!_isEdit) {
					recipeData.createRecipe(rf.recipeData)
						.then(_recipeSaved, _recipeSaveError);
				} else {
					recipeData.updateRecipe(rf.recipe._id, rf.recipeData)
						.then(_recipeSaved, _recipeSaveError);
				}
			};
		}

		recipeFormLink.$inject = ['$scope', '$elem', '$attrs'];

		function recipeFormLink($scope, $elem, $attrs) {
			// set up $scope object for namespacing
			$scope.rfl = {};

			/**
			 * Add new item
			 * Ingredient or Direction step
			 * Focus the newest input field
			 *
			 * @param $event {object} click event
			 * @param model {object} rf.recipeData model
			 */
			$scope.rfl.addItem = function($event, model) {
				var _newItem = {
					id: model.length + 1
				};

				model.push(_newItem);

				$timeout(function() {
					var _newestInput = angular.element($event.target).parent('p').prev('.last').find('input').eq(0);
					_newestInput.click();
					_newestInput.focus();
				});
			};

			/**
			 * Remove item
			 * Ingredient or Direction step
			 *
			 * @param model {object} rf.recipeData model
			 * @param i {index}
			 */
			$scope.rfl.removeItem = function(model, i) {
				model.splice(i, 1);
			};
		}

		return {
			restrict: 'EA',
			scope: {
				recipe: '=',
				userId: '@'
			},
			templateUrl: 'ng-app/core/recipeForm.tpl.html',
			controller: recipeFormCtrl,
			controllerAs: 'rf',
			bindToController: true,
			link: recipeFormLink
		}
	}
})();