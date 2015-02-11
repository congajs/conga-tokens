/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


// local modules
var TokenPayload = require('./payload/token-payload');

/**
 * The Token Document
 *
 * @Rest:Object
 *
 * @constructor
 */
function Token() {
	this.payload = new TokenPayload();
	this.requiredInput = {};
}

Token.prototype = {

	/**
	 * The token
	 *
	 * @type {String}
	 */
	token: null ,

	/**
	 * The token's payload
	 *
	 * @type {TokenPayload}
	 */
	payload: new TokenPayload() ,

	/**
	 * Object hash of required data to be collected from the user
	 *
	 * @type {Object}
	 */
	requiredInput: {} ,

	/**
	 * The token string of the composite token, this token belongs to
	 *
	 * @type {String|null}
	 */
	fromComposite: null ,

	/**
	 * The date this token expires
	 *
	 * @type {Date|null}
	 */
	expiresAt: null ,

	/**
	 * The date this token was executed
	 *
	 * @type {Date|null}
	 */
	executedAt: null ,

	/**
	 * The date this token was created
	 *
	 * @type {Date|null}
	 */
	createdAt: null ,

	/**
	 * The date this token was last updated
	 *
	 * @type {Date|null}
	 */
	updatedAt: null ,

	/**
	 * Function to execute when the token gets executed
	 *
	 * @type {Function|null}
	 */
	onExecute: null ,

	/**
	 * Set the payload data (you cannot change the class, just the data)
	 * @param payloadData
	 */
	setPayload: function(payloadData) {
		this.payload.setData(payloadData);
	} ,

	/**
	 * See if this token expires or not
	 *
	 * @returns {Boolean}
	 */
	isExpires: function() {
		return !!this.expiresAt;
	} ,

	/**
	 * See if this token has expired
	 *
	 * @returns {Boolean}
	 */
	isExpired: function() {
		if (!this.isExpires()) {
			return false;
		}
		return this.expiresAt.getTime() <= (new Date()).getTime();
	} ,

	/**
	 * See if this token has been executed
	 *
	 * @returns {null}
	 */
	isExecuted: function() {
		return !!this.executedAt;
	} ,

	/**
	 * Execute this token
	 *
	 * @param {Function} callback The callback to execute when finished
	 * @returns Token
	 */
	execute: function(callback) {

		if (this.isExecuted()) {
			callback(new Error('Token has already been executed'), this);
			return this;
		}

		this.executedAt = new Date();

		if (typeof this.onExecute === 'function') {

			this.onExecute(callback);

		} else if (typeof callback === 'function') {

			callback(null, this);

		}

		return this;
	} ,

	/**
	 * Get the String representation of this object
	 *
	 * @returns {String|null}
	 */
	toString: function() {
		return this.token;
	} ,

	/**
	 * Get a JSON representation of this object
	 *
	 * @Rest:SerializeMethod
	 *
	 * @returns {String|null} The token string
	 */
	toJSON: function() {
		return this.token;
	}
};

Token.prototype.constructor = Token;

module.exports = Token;