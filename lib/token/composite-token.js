/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// third party modules
var async = require('async');

// local modules
var ViewableToken = require('./viewable-token');

/**
 * The composite tokens contains multiple tokens
 * When executed, all other tokens are executed in sequence
 *
 * @constructor
 */
function CompositeToken() {

	ViewableToken.apply(this, arguments);

	this.tokens = [];
}

Conga.inherits(CompositeToken, ViewableToken, {

	/**
	 * Know that this is a composite token
	 *
	 * @params {Boolean}
	 */
	isComposite: true ,

	/**
	 * The tokens contained within this composite token
	 *
	 * @param {Array<{String}>}
	 */
	tokens: [] ,

	/**
	 * Add a token to the collection of tokens
	 * @param {Token} token
	 * @returns {CompositeToken}
	 * @throws Error
	 */
	addToken: function(token) {
		if (token instanceof Token ||
			token.constructor.name === 'Token') {

			if (this.tokens.indexOf(token) === -1) {
				this.tokens.push(token);
			}
			return this;

		} else {

			throw new Error('Invalid argument, Token expected, ' + token.constructor.name + ' given');
		}
	} ,

	/**
	 * Remove an existing token
	 * @param {Token|Object|String} token
	 * @returns {CompositeToken}
	 */
	removeToken: function(token) {
		if (token instanceof Object) {
			if (typeof token.token === 'string') {

				token = token.token;

			} else {

				return this;
			}
		} else if (typeof token !== 'string') {

			return this;
		}

		var idx = this.tokens.indexOf(token);
		if (idx > -1) {
			this.tokens = this.tokens.slice(0, idx).concat(this.tokens.slice(idx + 1, this.tokens.length));
		}

		return this;
	} ,

	/**
	 * See if a token exists
	 * @param {Token|Object|String} token
	 * @returns {Boolean}
	 */
	hasToken: function(token) {
		if (token instanceof Object) {
			if (typeof token.token === 'string') {

				token = token.token;

			} else {

				return false;
			}
		} else if (typeof token !== 'string') {

			return false;
		}

		return this.tokens.indexOf(token) > -1;
	} ,

	/**
	 * Given a token string, get the next token string in the list
	 * @param {String} token
	 * @returns {String|false}
	 */
	getNextToken: function(token) {
		if (token instanceof Object) {
			if (typeof token.token === 'string') {

				token = token.token;

			} else {

				return false;
			}
		} else if (typeof token !== 'string') {

			return false;

		}

		var idx = this.tokens.indexOf(token);
		if (idx === -1 || idx + 1 >= this.tokens.length) {
			return false;
		}

		return this.tokens[idx + 1];
	}
});

module.exports = CompositeToken;