/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * The token payload
 *
 * @Rest:Object
 *
 * @param {Object|undefined} data The payload data (optional)
 * @constructor
 */
function TokenPayload(data) {
	this.__data_ = data || {};
}

TokenPayload.prototype = {

	/**
	 * The payload  data
	 *
	 * @type {Object}
	 * @private
	 */
	__data_: {} ,

	/**
	 * Get the data
	 *
	 * @returns {Object}
	 */
	getData: function() {
		return this.__data_;
	} ,

	/**
	 * Set all the data at once
	 *
	 * @param {Object} data The object to set
	 * @returns {TokenPayload}
	 */
	setData: function(data) {
		this.__data_ = data || {};
		return this;
	} ,

	/**
	 * Set data for this payload
	 *
	 * @param {String} key The name for this data
	 * @param {*} value The value of this data
	 * @returns {TokenPayload}
	 */
	'set': function(key, value) {
		this.__data_[key] = value;
		return this;
	} ,

	/**
	 * Get data from this payload
	 *
	 * @param {String} key The name for the data you want
	 * @returns {*}
	 */
	'get': function(key) {
		if (this.has(key)) {
			return this.__data_[key];
		}
		return null;
	} ,

	/**
	 * Remove data from this payload
	 * @param {String} key The name for the data to remove
	 * @returns {TokenPayload}
	 */
	'del': function(key) {
		if (this.has(key)) {
			delete this.__data_[key];
		}
		return this;
	} ,

	/**
	 * See if data has been set
	 *
	 * @param {String} key The name for the data you are checking
	 * @returns {Boolean}
	 */
	'has': function(key) {
		return typeof this.__data_[key] !== 'undefined';
	} ,

	/**
	 * Get a JSON representation of this object
	 *
	 * @Rest:SerializeMethod
	 *
	 * @returns {Object} The data
	 */
	toJSON: function() {
		return this.getData();
	}
};

TokenPayload.prototype.constructor = TokenPayload;

module.exports = TokenPayload;