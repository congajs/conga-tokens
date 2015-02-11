/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local modules
var Token = require('./../token/token');
var TokenPayload = require('./../token/payload/token-payload');

/**
 * The Token document
 *
 * @Bass:Document
 * @Rest:Object
 *
 * @constructor
 */
function TokenDocument() {
	Token.apply(this, arguments);
}

Conga.inherits(TokenDocument, Token, {

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="String", name="token")
	 * @Rest:Property
	 */
	token: null,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Object", name="payload")
	 * @Rest:Property
	 */
	payload: new TokenPayload() ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="String", name="from_composite")
	 * @Rest:Property
	 */
	fromComposite: null ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Date", name="expires_at")
	 * @Rest:Property
	 */
	expiresAt: null,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Date", name="executed_at")
	 * @Rest:Property
	 */
	executedAt: null ,

	/**
	 * The version for this document
	 *
	 * @Bass:Version
	 * @Bass:Field(type="Number", name="version")
	 */
	version: null ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:CreatedAt
	 * @Bass:Field(type="Date", name="created_at")
	 * @Rest:Property
	 */
	createdAt: null,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:UpdatedAt
	 * @Bass:Field(type="Date", name="updated_at")
	 */
	updatedAt: null
});

module.exports = TokenDocument;