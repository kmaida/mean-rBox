/*
 |--------------------------------------------------------------------------
 | Recipe Model
 |--------------------------------------------------------------------------
 */

var mongoose = require('mongoose');
var config = require('../config');

var recipeSchema = new mongoose.Schema({
	userId: String,
	name: String,
	slug: String,
	isPublic: Boolean
});

var Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = mongoose.model('Recipe', recipeSchema);