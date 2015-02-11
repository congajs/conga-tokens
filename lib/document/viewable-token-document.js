/*
 * This file is part of the conga-tokens library.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// local modules
var ViewableToken = require('./../token/viewable-token');

/**
 * The Viewable Token document
 *
 * @Bass:Document
 * @Bass:Inherit(document="TokenDocument")
 *
 * @constructor
 */
function ViewableTokenDocument() {
	ViewableToken.apply(this, arguments);
}

Conga.inherits(ViewableTokenDocument, ViewableToken, {

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Boolean", name="is_viewable")
	 * @Rest:Property
	 */
	isViewable: true ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Number", name="view_limit")
	 * @Rest:Property
	 */
	viewLimit: null ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Number", name="num_views")
	 * @Rest:Property
	 */
	numViews: 0 ,

	/**
	 * {@inheritdoc}
	 *
	 * @Bass:Field(type="Array", name="viewed_at")
	 * @Rest:Property
	 */
	viewedAt: null

});

module.exports = ViewableTokenDocument;