/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local modules
var Token = require('./token');
var ViewablePayload = require('./payload/viewable-payload');

/**
 * Viewable tokens have extra data and logic
 *
 * @constructor
 */
function ViewableToken() {
	Token.apply(this, arguments);

	this.payload = new ViewablePayload();

	if (!Array.isArray(this.viewedAt)) {
		if (this.viewedAt) {

			this.viewedAt = [this.viewedAt];

		} else {

			this.viewedAt = [];
		}
	}
}

Conga.inherits(ViewableToken, Token, {

	/**
	 * {@inheritdoc}
	 *
	 * @type {TokenPayload}
	 */
	payload: new ViewablePayload() ,

	/**
	 * Boolean flag setting whether this token is viewable or not
	 * @param {Boolean}
	 */
	isViewable: true ,

	/**
	 * The dates this token is accessed
	 * @param {Array<{Date}>}
	 */
	viewedAt: null ,

	/**
	 * Maximum number of views this token allows
	 * @param {Number}
	 */
	viewLimit: null ,

	/**
	 * The number of times this token has been viewed (accessed)
	 * @param {Number}
	 */
	numViews: 0 ,

	/**
	 * Function executed when this token is viewed
	 * @param {Function|null}
	 */
	onView: null ,

	/**
	 * View this token
	 * @param callback
	 * @returns {ViewableToken}
	 */
	view: function(callback) {

		var numViews = this.numViews + 1;

		if (numViews >= this.viewLimit) {
			callback(new Error('You have viewed this token too many times.'));
			return this;
		}

		this.numViews = numViews;
		this.viewedAt.push(new Date());

		if (typeof this.onView === 'function') {

			this.onView(callback);

		} else if (typeof callback === 'function') {

			callback();
		}

		return this;
	}

});

module.exports = ViewableToken;