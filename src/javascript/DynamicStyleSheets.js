/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

"use strict"

var EXPORTED_SYMBOLS = [ "DynamicStyleSheets" ];

Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * DynamicStyleSheets is a helper utility that allows to register stylesheets on
 * the fly, and also remove them with ease.
 */
var DynamicStyleSheets = function() {
	/** The stylesheet service provided by Firefox. */
	this.service = null,
	
	 /** The list of stylesheets that are registered. */
	this.styleSheets = {},
	
	/**
	 * Initializes the DynamicStyleSheets class.
	 */
	this.init = function() {
		var component = Components.classes["@mozilla.org/content/style-sheet-service;1"];
		this.service = component.getService(Components.interfaces.nsIStyleSheetService);
	},
	
	/**
	 * Converts the given style to a string, if needed.
	 *
	 * @param style The style to convert. Can be either a string or CSSBuilder.
	 * @return The style as string.
	 */
	this.getCSS = function(style) {
		if (typeof style === "string") {
			return style;
		} else if (typeof style.toCSS === "function") {
			return style.toCSS();
		} else {
			throw "Cannot use \"" + typeof style + "\" as style.";
		}	
	},
	
	/**
	 * Registers the given stylesheet with the given name.
	 *
	 * @param name The name of the stylesheet. Needs to be unique.
	 * @param style The content of the stylesheet to register.
	 */
	this.register = function(name, style) {
		this.registerPath(name, "data:text/css;base64," + btoa(style));
	},
	
	/**
	 * Registers the given stylesheet with the given name for the browser. <p/>
	 * Means it will be prefixed with the mozilla namespace and the rule for the
	 * browser.xul file.
	 *
	 * @param name The name of the stylesheet. Needs to be unique.
	 * @param style The content of the stylesheet to register. This is a plain
	 *              CSS string without the namespace header.
	 */
	this.registerForBrowser = function(name, style) {
		var styleSheetContent = "@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);";
		styleSheetContent = styleSheetContent + "@-moz-document url(chrome://browser/content/browser.xul) {";
		styleSheetContent = styleSheetContent + this.getCSS(style);
		styleSheetContent = styleSheetContent + "}";
		
		this.register(name, styleSheetContent);
	},
	
	/**
	 * Registers the given stylesheet with the given name for the given domain.
	 * Means it will be prefixed with the default namespace and the rule
	 * for the given domain.
	 *
	 * @param name The name of the stylesheet. Needs to be unique.
	 * @param style The content of the stylesheet to register. This is a plain
	 *               CSS string without the namespace header.
	 */
	this.registerForDomain = function(name, domain, style) {
		var styleSheetContent = "@namespace url(http://www.w3.org/1999/xhtml);";
		styleSheetContent = styleSheetContent + "@-moz-document domain(" + domain + ") {";
		styleSheetContent = styleSheetContent + this.getCSS(style);
		styleSheetContent = styleSheetContent + "}";
		
		this.register(name, styleSheetContent);
	},
	
	/**
	 * Registers the given stylesheet with the given name. Means it will be
	 * prefixed with the default namespace and no rule. If you want to register
	 * a stylesheet with your own at-rules, this is the function you're looking
	 * for.
	 *
	 * @param name The name of the stylesheet. Needs to be unique.
	 * @param style The content of the stylesheet to register. This is a plain
	 *              CSS string without the namespace header.
	 */
	this.registerForGeneric = function(name, style, domains) {
		var styleSheetContent = "@namespace url(http://www.w3.org/1999/xhtml);";
		styleSheetContent = styleSheetContent + this.getCSS(style);
		
		this.register(name, styleSheetContent);
	},
	
	/**
	 * Registers the given path.
	 *
	 * @param name The name of the path.
	 * @param path The path to register. Is expected to be a valid URI.
	 */
	this.registerPath = function(name, path) {
		this.unregister(name)
		
		this.styleSheets[name] = Services.io.newURI(path, null, null);
		
		var styleSheet = this.styleSheets[name];
		
		if (!this.service.sheetRegistered(styleSheet, this.service.USER_SHEET)) {
			this.service.loadAndRegisterSheet(styleSheet, this.service.USER_SHEET);
		}
	},
	
	/**
	 * Removes the stylesheet or path with the given name.
	 *
	 * @param name The name of the stylsheet or path to remove.
	 */
	this.unregister = function(name) {
		var styleSheet = this.styleSheets[name];
		
		if (styleSheet != null) {
			if (this.service.sheetRegistered(styleSheet, this.service.USER_SHEET)) {
				this.service.unregisterSheet(styleSheet, this.service.USER_SHEET);
			}
		}
		
		this.styleSheets[name] = null;
	},
	
	/**
	 * Removes all registered stylesheets or paths.
	 */
	this.unregisterAll = function() {
		for ( var name in this.styleSheets) {
			this.unregister(name);
		}
	}
};

