// Syntactic sugar

function _getById(id) {
    return document.getElementById(id);
}

function _create(tag) {
    return document.createElement(tag);
}

function showElement(element, isShown) {
    if (!isUndefined(element) && element != null) {
        if (element.tagName.toLowerCase() === 'i')
            element.style.visibility = isShown ? 'shown' : 'hidden';
        else {
            if (isShown)
                element.removeAttribute('hidden');
            else
                element.setAttribute('hidden', 'true');
        }
    }
}

function enableElement(element, isEnabled) {
    if (!isUndefined(element) && element != null) {
        if (element.tagName.toLowerCase() === 'a')
            element.style.visibility = isEnabled ? 'shown' : 'hidden';
        else {
            if (isEnabled)
                element.removeAttribute('disabled');
            else
                element.setAttribute('disabled', 'true');
        }
    }
}


// Color

function defaultColor() {
    var divColor = _getById('divColor');
    divColor.style.border = '1px solid blue';
}

function defaultBackground() {
    var divColor = _getById('divColor');
    divColor.style.backgroundColor = 'transparent';
}

function updateColor(jscolor) {
    // 'jscolor' instance can be used as a string
    var divColor = _getById('divColor');
	
	var color = '#' + jscolor;
	if (_getById('rdoFrame').checked)
		divColor.style.border = '3px solid ' + color;

	if (_getById('rdoBackground').checked)
		divColor.style.backgroundColor = color;	
}


// Offset, position

function getViewerOffset() {
	return getPosition('seadragon-viewer');
}

function getPosition(elId) {
	var xPos = 0;
	var yPos = 0;
	
	var el = _getById(elId);

	while (el) {
		if (el.tagName.toLowerCase() == 'body') {
			var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
			var yScroll = el.scrollTop || document.documentElement.scrollTop;

			xPos += (el.offsetLeft - xScroll + el.clientLeft);
			yPos += (el.offsetTop - yScroll + el.clientTop);
		}
		else {
			// for all other non-BODY elements
			xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
			yPos += (el.offsetTop - el.scrollTop + el.clientTop);
		}

		el = el.offsetParent;
	}
	
	return {
		x: xPos,
		y: yPos
	};
}


// Layers, Selected Regions

function getSelectedRegionFromCtrlClick(mouseEvent) {
    return getSelectedRegionFromId(mouseEvent.currentTarget.id);
}

function getSelectedRegionFromId(id) {
    ss = id.split('_');
    return getLayerCollection().layers[parseInt(ss[1])].selectedRegions[parseInt(ss[2])];
}

function getLayerFromCtrlClick(mouseEvent) {
    ss = mouseEvent.currentTarget.id.split('_');
    return getLayerCollection().layers[parseInt(ss[1])];
}

function swapDown(strId) {
    ss = strId.split('_');
    var j = parseInt(ss[2]);
    var srs = getLayerCollection().layers[parseInt(ss[1])].selectedRegions;
    var selectedRegion = srs[j];

    if (j > 0) {
        sr = srs[j - 1];

        // Swap
        var temp = sr.zOrder;
        sr.zOrder = selectedRegion.zOrder;
        selectedRegion.zOrder = temp;

        srs[j] = sr;
        srs[j - 1] = selectedRegion;
    }
}

function swapUp(strId) {
    ss = strId.split('_');
    var j = parseInt(ss[2]);
    var srs = getLayerCollection().layers[parseInt(ss[1])].selectedRegions;
    var selectedRegion = srs[j];

    if (j < srs.length - 1) {
        sr = srs[j + 1];

        // Swap
        var temp = sr.zOrder;
        sr.zOrder = selectedRegion.zOrder;
        selectedRegion.zOrder = temp;

        srs[j] = sr;
        srs[j + 1] = selectedRegion;    
    }
}

function initSelectElement(slt, srcCollection, onChangeFunc) {
    slt.innerHTML = ''; 
    for (var i = 0; i < srcCollection.length; i++) {
        var opt = _create('option');
        opt.innerHTML = srcCollection[i].replaceAll('_', ' ');
        opt.value = i;
        if (i === 0)
            opt.selected = true;
        slt.appendChild(opt);
    }

    slt.onchange = onChangeFunc;
}


// Awesome Font

var editSRTagName = 'a'; // 'a'

function createAwesomeDeleteLayer(id, func) {
    return createAwesomeInsertedObject(editSRTagName, id, func, 'fa fa-trash-o fa-lg', 'btn btn-danger');
}

function createAwesomeEditLayer(id, func) {
    return createAwesomeInsertedObject(editSRTagName, id, func, 'fa fa-pencil fa-lg', 'btn btn-danger');
}

function createAwesomeDelete(id, func) {
    return createAwesomeInsertedObject(editSRTagName, id, func, 'fa fa-trash fa-lg', 'btn btn-danger');
}

function createAwesomeEdit(id, func) {
    return createAwesomeInsertedObject(editSRTagName, id, func, 'fa fa-pencil-square fa-lg', 'btn btn-danger');
}

function createAwesomeUp(id, func) {
    return createAwesomeInsertedObject(editSRTagName, id, func, 'fa fa-arrow-circle-up', 'btn btn-danger');
}

function createAwesomeDown(id, func) {
    return createAwesomeInsertedObject(editSRTagName, id, func, 'fa fa-arrow-circle-down', 'btn btn-danger');
}

function createAwesomeLayerCollapse(id, func) {
    return createAwesomeInsertedCheckbox(id, func,
        ['fa fa-caret-square-o-down fa-lg', 'fa fa-caret-square-o-right fa-lg']);
}

function createAwesomeLayerShow(id, func) {
    return createAwesomeInsertedCheckbox(id, func,
        ['fa fa-toggle-on fa-lg', 'fa fa-toggle-off fa-lg']);
}

function createAwesomeCollapse(id, func) {
    return createAwesomeInsertedCheckbox(id, func,
        ['fa fa-caret-down', 'fa fa-caret-right']);
}

function createAwesomeShow(id, func) {
    return createAwesomeInsertedCheckbox(id, func,
        ['fa fa-circle', 'fa fa-circle-o']);
}

function createAwesomeEditMode(func) {
    var chbEdit = createAwesomeInsertedCheckbox('chbEdit', func,
        ['fa fa-pencil-square fa-lg', 'fa fa-pencil-square-o fa-lg']);
    _getById('devEdit').appendChild(chbEdit);
    return chbEdit;
}

function createAwesomedevImageListUpdate() {
    const lblId = 'lblImLUpdate';
    if (_getById(lblId) === null) {
        _getById('devEdit').appendChild(chbEdit);
        var lblImLUpdate = createAwesomeInsertedObject('label', lblId, undefined, 'fa fa-flag-checkered fa-2x', undefined);
        _getById('devImageListUpdate').appendChild(lblImLUpdate);
    }
}

function createAwesomePanelSwap(func) {
    var arr = __isRightLayout
                  ? ['fa fa-arrow-left fa-lg', 'fa fa-arrow-right fa-lg']
                  : ['fa fa-arrow-right fa-lg', 'fa fa-arrow-left fa-lg'];

    var chbPanelSwap = createAwesomeInsertedCheckbox('chbPanelSwap', func, arr);
    _getById('devPanelSwap').appendChild(chbPanelSwap);

    if (!__isRightLayout)
        func();

    return chbPanelSwap;
}

function createAwesomeInner(innerClassName) {
    var inner = _create('i');
    inner.className = innerClassName /*+ ' aria - hidden="true'*/;
    return inner;
}

function createAwesomeInsertedObject(tagName, id, func, innerClassName, outerClassName, text) {
    var outer = _create(tagName);
    outer.className = outerClassName;

    switch (tagName) {
        case 'a':
            outer.href = '#';
            break;
    }
    
    outer.innerHTML = isUndefined(text) ? '' : text;
    outer.id = id;
    outer.onclick = func;
    outer.appendChild(createAwesomeInner(innerClassName));
    return outer;
}

function createAwesomeInsertedCheckbox(id, func, arrInnerClassName, text) {
    var outer = _create('checkbox');
    outer.className = 'checkbox';
    outer.innerHTML = isUndefined(text) ? '' : text;
    outer.id = id;

    var inner = [];
    for (var i = 0; i < 2; i++)
        inner.push(createAwesomeInner(arrInnerClassName[i]));

    outer.checked = false;
    outer.appendChild(inner[0]);
   
    outer.onclick = function (arg) {
        outer.checked = isUndefined(arg) || isUndefined(arg.shouldCheck) ? !outer.checked : arg.shouldCheck;
        outer.removeChild(outer.firstChild);
        outer.appendChild(inner[outer.checked ? 1 : 0]);
        
        if (isUndefined(arg.noUpdate))
            func({ id: outer.id, checked: outer.checked });
    }

    return outer;
}


