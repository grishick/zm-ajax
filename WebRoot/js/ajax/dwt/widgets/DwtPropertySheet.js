/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at: http://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15 
 * have been added to cover use of software over a computer network and provide for limited attribution 
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B. 
 * 
 * Software distributed under the License is distributed on an "AS IS" basis, 
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. 
 * See the License for the specific language governing rights and limitations under the License. 
 * The Original Code is Zimbra Open Source Web Client. 
 * The Initial Developer of the Original Code is Zimbra, Inc. 
 * All portions of the code are Copyright (C) 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014 Zimbra, Inc. All Rights Reserved. 
 * ***** END LICENSE BLOCK *****
 */

/**
 * 
 * @private
 */
DwtPropertySheet = function(parent, className, posStyle, labelSide) {
	if (arguments.length == 0) return;
	className = className || "DwtPropertySheet";
	DwtComposite.call(this, {parent:parent, className:className, posStyle:posStyle});

	this._labelSide = labelSide || DwtPropertySheet.DEFAULT;

	this._propertyIdCount = 0;
	this._propertyList = [];
	this._propertyMap = {};

	this._tabGroup = new DwtTabGroup(this.toString());

	this._tableEl = document.createElement("TABLE");
	// Cellspacing needed for IE in quirks mode
	this._tableEl.cellSpacing = 6;

	var element = this.getHtmlElement();
	element.appendChild(this._tableEl);
	this._setAllowSelection();
}

DwtPropertySheet.prototype = new DwtComposite;
DwtPropertySheet.prototype.constructor = DwtPropertySheet;

DwtPropertySheet.prototype.toString = 
function() {
	return "DwtPropertySheet";
}

// Constants

DwtPropertySheet.RIGHT = "right";
DwtPropertySheet.LEFT = "left";
DwtPropertySheet.DEFAULT = DwtPropertySheet.LEFT;

// Data

DwtPropertySheet.prototype._labelCssClass = "Label";
DwtPropertySheet.prototype._valueCssClass = "Field";

// Public methods

/**
 * Adds a property.
 *
 * @param label [string] The property label. The value is used to set the
 *				inner HTML of the property label cell.
 * @param value The property value. If the value is an instance of DwtControl
 *				the element returned by <code>getHtmlElement</code> is used;
 *				if the value is an instance of Element, it is added directly;
 *				anything else is set as the inner HTML of the property value
 *				cell.
 * @param required [boolean] Determines if the property should be marked as
 *				   required. This is denoted by an asterisk next to the label.
 */
DwtPropertySheet.prototype.addProperty = function(label, value, required) {
	var index = this._tableEl.rows.length;

	var row = this._tableEl.insertRow(index);
	row.vAlign = this._vAlign ? this._vAlign : "top";

	var labelId = Dwt.getNextId(),
		valueId = Dwt.getNextId();

	if (this._labelSide == DwtPropertySheet.LEFT) {
		this._insertLabel(row, label, required, labelId, valueId);
		this._insertValue(row, value, required, labelId, valueId);
	}
	else {
		this._insertValue(row, value, required, labelId, valueId);
		this._insertLabel(row, label, required, labelId, valueId);
	}

	var id = this._propertyIdCount++;
	var property = {
		id:         id,
		index:      index,
		row:        row,
		visible:    true,
		labelId:    labelId,
		valueId:    valueId
	};
	this._propertyList.push(property);
	this._propertyMap[id] = property;
	return id;
};

DwtPropertySheet.prototype._insertLabel = function(row, label, required, labelId, valueId) {

	var labelCell = row.insertCell(-1);
	labelCell.className = this._labelCssClass;
	labelCell.id = labelId;
	labelCell.setAttribute("for", valueId);
	if (this._labelSide != DwtPropertySheet.LEFT) {
		labelCell.width = "100%";
		labelCell.style.textAlign = "left";
	}
	labelCell.innerHTML = label;
	if (required) {
		var asterisk = this._tableEl.ownerDocument.createElement("SUP");
		asterisk.innerHTML = "*";
		labelCell.insertBefore(asterisk, labelCell.firstChild);
	}
};

DwtPropertySheet.prototype._insertValue = function(row, value, required, labelId, valueId) {

	var valueCell = row.insertCell(-1);
	valueCell.className = this._valueCssClass;
	valueCell.id = valueId;

	if (!value) {
		valueCell.innerHTML = "&nbsp;";
	} else if (value.isDwtControl) {
		valueCell.appendChild(value.getHtmlElement());
		this._tabGroup.addMember(value);
		var input = value.getInputElement && value.getInputElement();
		if (input) {
			input.setAttribute('aria-labelledby', labelId);
		}
	}
	/**** NOTE: IE says Element is undefined
	else if (value instanceof Element) {
	/***/
	else if (value.nodeType == AjxUtil.ELEMENT_NODE) {
	/***/
		valueCell.appendChild(value);
		this._addTabGroupMemberEl(valueCell);
		value.setAttribute('aria-labelledby', labelId);
	} else {
		valueCell.innerHTML = String(value);
		this._addTabGroupMemberEl(valueCell);
		valueCell.setAttribute('aria-labelledby', labelId);
	}
};

/**
 * Add element's leaf children to tabgroup.
 *
 * @param element HTML element.
 */
DwtPropertySheet.prototype._addTabGroupMemberEl = function(element){
	var obj = this;

	// recursive funtion to add HTML leafs
	function addChildren(el){
		if(el.children.length > 0){
			AjxUtil.foreach(el.children, function(child){
				addChildren(child);
			});
		}
		else{
			// add leaf to tabgroup
			obj._makeFocusable(el);
			obj._tabGroup.addMember(el);
		}
	}

	addChildren(element);
};

DwtPropertySheet.prototype.getTabGroupMember = function() {
	return this._tabGroup;
};

DwtPropertySheet.prototype.getProperty = function(id) {
	return this._propertyMap[id];
};

DwtPropertySheet.prototype.removeProperty = function(id) {
	var prop = this._propertyMap[id];
	if (prop) {
		var propIndex = prop.index;
		if (prop.visible) {
			var tableIndex = this.__getTableIndex(propIndex);
			var row = this._tableEl.rows[tableIndex];
			row.parentNode.removeChild(row);
		}
		prop.row = null;
		for (var i = propIndex + 1; i < this._propertyList.length; i++) {
			this._propertyList[i].index--;
		}
		this._propertyList.splice(propIndex, 1);
		delete this._propertyMap[id];
	}
};

DwtPropertySheet.prototype.setPropertyVisible = function(id, visible) {
	var prop = this._propertyMap[id];
	if (prop && prop.visible != visible) {
		prop.visible = visible;
		var propIndex = prop.index;
		if (visible) {
			var tableIndex = this.__getTableIndex(propIndex);
			var row = this._tableEl.insertRow(tableIndex);
			DwtPropertySheet.__moveChildNodes(prop.row, row);
			prop.row = row;
		}
		else {
			var row = prop.row;
			if (row && row.parentNode) {
				row.parentNode.removeChild(row);
			}
		}
	}
};

DwtPropertySheet.prototype.__getTableIndex = function(propIndex) {
	var tableIndex = 0;
	for (var i = 0; i < propIndex; i++) {
		var prop = this._propertyList[i];
		if (prop.visible) {
			tableIndex++;
		}
	}
	return tableIndex;
};

DwtPropertySheet.__moveChildNodes = function(srcParent, destParent) {
	if (srcParent === destParent) return;
	var srcChild = srcParent.firstChild;
	while (srcChild != null) {
		destParent.appendChild(srcChild);
		srcChild = srcParent.firstChild;
	}
};
