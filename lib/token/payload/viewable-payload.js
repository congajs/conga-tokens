/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local modules
var TokenPayload = require('./token-payload');

/**
 * The viewable payload
 *
 * {@inheritdoc}
 *
 * @Rest:Object
 */
function ViewablePayload() {
	TokenPayload.apply(this, arguments);
}

Conga.inherits(ViewablePayload, TokenPayload, {

	/**
	 * {@inheritdoc}
	 *
	 * @Rest::SerializeMethod
	 */
	toJSON: function() {
		return TokenPayload.prototype.toJSON.apply(this, arguments);
	}

});

module.exports = ViewablePayload;