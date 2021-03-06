/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
 * ***** END LICENSE BLOCK *****
 */


/**
 * 
 * 
 * @private
 */
XFG = function() {} // XFormGlobal

XFG.prefixList = {};
XFG.objectCache = {};
XFG.getUniqueId = function (namePrefix) {
	if (namePrefix == null) namePrefix = "__id__";
	var list = XFG.prefixList;

	// if we've never seen one of these before, call it the name they passed in
	//	(without a number) and set the counter to 1 (so the next one is #2)
	if (list[namePrefix] == null) {
		list[namePrefix] = 1;
		return namePrefix;
	} else {
		list[namePrefix]++;
		return namePrefix + "_" + list[namePrefix];
	}
};

XFG.assignUniqueId = function (object, namePrefix) {
	var id = XFG.getUniqueId(namePrefix);
	object.__id = id;
	XFG.objectCache[id] = object;
};

XFG.cacheGet = function (id){
	return XFG.objectCache[id];
}

XFG.createEl = function (id, parentEl, tagName, contents) {
	// create the element
	if (tagName == null) tagName = "div";
	var el = window.document.createElement(tagName);

	// set its id and contents (if supplied)
	el.id = id;
	if (contents != null) el.innerHTML = contents;

	// root it under the parent
	if (parentEl == null) {
		parentEl = document.body;
	}
	parentEl.appendChild(el);
	
	return el;
}

XFG.getEl = function (id, frame) {
	// if they passed something other than a string, assume its the element itself
	if (typeof id != "string") return id;
	
	var doc = (doc == null ? document : frame.document);
	var it = doc.getElementById(id);
	if (it == null) it = null;
	return it;
};

XFG.hideEl = function (id,isBlock) {
	var el = (typeof id == "string" ? XFG.getEl(id) : id);
	if (el) {
		if(!isBlock)
			el.style.display = "none";
			
		el.style.visibility = "hidden";
	} else {
		DBG.println("hideEl(", id, "): element not found");
	}
};

XFG.showEl = function (id) {
	var el = (typeof id == "string" ? XFG.getEl(id) : id);
	if (el) {
		if (el.tagName == "TD") {
			el.style.display = "table-cell";
		} else {
			el.style.display = "block";
		}
		el.style.visibility = "visible";
	} else {
		DBG.println("showEl(", id, "): element not found");
	}
};

XFG.getClassName = function(element) {
	if (typeof element == "string") element = XFG.getEl(element);
	if (element) return element.className;
	return "";
};

XFG.showSelected = function (element) {
	XFG.setClassName(element, XFG.addSuffix(XFG.getClassName(element), "_selected"));
};

XFG.hideSelected = function (element) {
	XFG.setClassName(element, XFG.removeSuffix(XFG.getClassName(element), "_selected"));
};

XFG.setClassName = function (element, className) {
	if (typeof element == "string") element = XFG.getEl(element);
	if (element) element.className = className;
};

XFG.addSuffix = function (text, suffix) {
	if (text.indexOf(suffix) > -1) return text;
	return text + suffix;
};

XFG.removeSuffix = function (text, suffix) {
	if (text.indexOf(suffix) < 0) return text;
	return text.substring(0, text.indexOf(suffix));	
};

XFG.showOver = function (element) {
	XFG.setClassName(element, XFG.addSuffix(XFG.getClassName(element), "_over"));
};

XFG.hideOver = function (element) {
	XFG.setClassName(element, XFG.removeSuffix(XFG.getClassName(element), "_over"));
}


XFG.showDisabled = function (element) {
	XFG.setClassName(element, XFG.addSuffix(XFG.getClassName(element), "_disabled"));
};

XFG.hideDisabled = function (element) {
	XFG.setClassName(element, XFG.removeSuffix(XFG.getClassName(element), "_disabled"));
}



/* StringBuffer class  changed to AjxBuffer and moved into Ajax/js/util/  */



XFG.getCookie = function (name) {
	var value = new RegExp(name + "=([^;]+)").exec(document.cookie);
	return (value != null) ? unescape(value[1]) : null;
}


XFG.setCookie = function (name, value) { // use: setCookie("name", value);
	document.cookie = name + "=" + escape(value);
}




XFG.valueToString = function (value, skipDerivedProperties, skipMethods, skipPrototypeProperties) {
	if (value == null) return "null";

	// strings get quotes
	if (typeof value == "string") return '"' + value + '"';

	// for arrays, list all the objects in it
	if (value instanceof Array) {
		var buffer = new AjxBuffer();
		for (var i = 0; i < value.length; i++) {
			buffer.append("        ", XFG.valueToString(value[i], "    ", skipDerivedProperties, skipMethods, skipPrototypeProperties));
		}
		return "[\n" + buffer.join(",\n") + "\n" + "    ]";
	}

	// for dates, return the syntax to create a new date (might as well)
	if (value instanceof Date) {
		return " new Date("+ [value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds()].join(",") + ")";
	}
	
	if (typeof value == "function") {
		return "(function)";
	}

	// for objects, call
	if (typeof value == "object") return XFG.objectToString(value, "    ", skipDerivedProperties, skipMethods, skipPrototypeProperties);
	
	return value;	
}

XFG.objectToString = function (object, skipDerivedProperties, skipMethods, skipPrototypeProperties) {

	var indentSpacer = "    ";
	var buffer = [];
	var hasObject = false;
	var propCount = 0;
	var proto = object.constructor.prototype;

	if (proto == null) proto = {};
	for (var prop in object) {
		var value = object[prop];
		if (skipPrototypeProperties && (object[prop] == proto[prop])) continue;
		if (skipMethods && value instanceof Function) continue;
		
		// if we have a derived property, write its id or [object] so we don't recurse too much
		if ((prop.indexOf("__") == 0 || prop.indexOf("$") == 0) && value instanceof Object) {
			buffer.push(AjxBuffer.concat(prop, ": ", value.toString()));
		} else {
			hasObject = hasObject || (typeof value == "object");
			buffer.push(AjxBuffer.concat(prop, ": ", XFG.valueToString(value, skipDerivedProperties, skipMethods, skipPrototypeProperties)));
		}
		propCount++;
	}
	buffer.sort(XFG.sortSpecialLast);
	if (hasObject || propCount > 5) {
		return "{\n" + indentSpacer + buffer.join(",\n"+ indentSpacer) + "\n" + "}"
	} else {
		return "{" + indentSpacer + buffer.join(", ") + indentSpacer + "}";
	}
}

XFG.sortSpecialLast = function (a,b) {
	var a1 = a.charAt(0);
	var b1 = b.charAt(0);
	var aIsSpecial = a1 == "_" || a1 == "$";
	var bIsSpecial = b1 == "_" || b1 == "$";
	if ( !aIsSpecial && !bIsSpecial) {
		return (a > b ? 1 : -1)
	} else if (aIsSpecial && bIsSpecial) {
		return (a > b ? 1 : -1)
	} else if (aIsSpecial) {
		return 1;
	} else {
		return -1;
	}
	
}



/* DEPRECATED:  Use AjxBuffer() instead */
StringBuffer = function() {
	this.clear();
	if (arguments.length > 0) {
		arguments.join = this.buffer.join;
		this.buffer[this.buffer.length] = arguments.join("");
	}
}
StringBuffer.prototype.toString = function () {
	return this.buffer.join("");
}
StringBuffer.prototype.join = function (delim) {
	if (delim == null) delim = "";
	return this.buffer.join(delim);
}
StringBuffer.prototype.append = function () {
	arguments.join = this.buffer.join;
	this.buffer[this.buffer.length] = arguments.join("");
}
StringBuffer.prototype.join = function (str) {
	return this.buffer.join(str);
}
StringBuffer.prototype.set = function(str) {
	this.buffer = [str];
}
StringBuffer.prototype.clear = function() {
	this.buffer = [];
}
StringBuffer.concat = function() {
	arguments.join = Array.prototype.join;
	return arguments.join("");
}

XFG.ARROW_DOWN = 40;
XFG.ARROW_LEFT = 37;
XFG.ARROW_RIGHT = 39;
XFG.ARROW_UP = 38;	
