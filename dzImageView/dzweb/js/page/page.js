function PageInit(imageNames, startupCallback) {
	setDivAnnotationHeightInPx();
	
    var firstItem;
    this.callback = startupCallback;
    if (imageNames.length > 0) {
        var me = this;

        _getById('lblSelectImage').textContent = TXT.SelectImage;
        var sltSelectImage = _getById('sltSelectImage');

        initSelectElement(sltSelectImage, imageNames, function (arg) {
            me.callback(imageNames[arg.currentTarget.value]);
        });

        showElement(_getById('lblSelectImageValue'), false);

        firstItem = imageNames[0]
    }

    this.callback(firstItem);
}

function Page(mainDzCallback) {
    var me = this;

    this.tdNumber = 8; // const
    this.minFrameThickness = 0;
    this.maxFrameThickness = 9;

    this.tdImageListUpdateIndicator = _getById('tdEditTools' + this.tdNumber.toString());

    // Edit / View
    var chbEdit = createAwesomeEditMode(function () {
        var isEditMode = chbEdit.checked;
        me.callback({ isEditMode: isEditMode });

        var tdEditTools = _getById('tdEditTools');

        // Editing
        me.showEditTools(isEditMode);
        me.callback({ edit: isEditMode });

        var sltSelectImage = _getById('sltSelectImage');
        var lblSelectImageValue = _getById('lblSelectImageValue');
        lblSelectImageValue.textContent = sltSelectImage.options[sltSelectImage.selectedIndex].text;
        lblSelectImageValue.className = 'imageNameUnderEdit';
        showElement(sltSelectImage, !isEditMode);
        showElement(_getById('lblSelectImageValue'), isEditMode);
        _getById('lblSelectImage').textContent = isEditMode ? TXT.ImageWithColon : TXT.SelectImage;

        defaultColor();
        defaultBackground();

        var divEditToolsContainer = document.getElementsByClassName('editTools');
        if (isUndefined(divEditToolsContainer) || divEditToolsContainer.length === 0)
            divEditToolsContainer = document.getElementsByClassName('editTools-Active');
        divEditToolsContainer[0].className = isEditMode ? 'editTools-Active' : 'editTools';

        var layers = getLayerCollection().layers;
        if (layers.length > 0) {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var selectedRegions = layer.selectedRegions;

                showElement(_getById('btnEdit' + '_' + i.toString()), isEditMode);
                showElement(_getById('btnDelete' + '_' + i.toString()), isEditMode);

                for (var j = selectedRegions.length - 1; j >= 0; j--) {
                    var suffixId = '_' + i.toString() + '_' + j.toString();
                    showElement(_getById('btnEdit' + suffixId), isEditMode);
                    showElement(_getById('btnDelete' + suffixId), isEditMode);
                    showElement(_getById('btnUp' + suffixId), isEditMode);
                    showElement(_getById('btnDown' + suffixId), isEditMode);
                }
            }
        }
    });
	
	this.callback = mainDzCallback;
	this.showEditTools(false);
	
	var rdoFrame = _getById('rdoFrame');
	var rdoBackground = _getById('rdoBackground');
    _getById('lblFrame').textContent = TXT.Frame;
	_getById('lblBackground').textContent = TXT.Background;
	rdoFrame.setAttribute('checked', 'true');
	rdoFrame.onclick = function(arg) {
	    rdoBackground.checked = !rdoFrame.checked;
	    defaultColor();
	}
	rdoBackground.onchange = function(arg) {
	    rdoFrame.checked = !rdoBackground.checked;
	    defaultBackground();
	}
	
	var divColor = _getById('divColor');

	var colorPicker = _getById('colorPicker');
    colorPicker.innerText = TXT.Color;

	_getById('lblEdit').textContent = TXT.Edit;
	_getById('lblType').textContent = TXT.Type;
	var sltType = _getById('sltType');
	var btnPolygonClose = _getById('btnPolygonClose');
	var types = [TXT.Rectangle, TXT.Circle, TXT.Polygon];

	initSelectElement(sltType, types, function (arg) {
	    btnPolygonClose.hidden = !(arg.currentTarget.value === '2'); // Polygon
	});
		
	btnPolygonClose.hidden = true;
    btnPolygonClose.innerHTML = '<i class="fa fa-retweet"></i> ' + TXT.ClosePolygon;
	btnPolygonClose.onclick = function() {
		me.callback({polygonEnd: true});
    }

    _getById('lblFrameThicknessTitle').textContent = TXT.FrameThicknessTitle;
    var lblFrameThickness = _getById('lblFrameThickness');
    lblFrameThickness.textContent = '3';

    var btnThinnerFrame = _getById('btnThinnerFrame');
    enableElement(btnThinnerFrame, true);
    btnThinnerFrame.innerHTML = '<i class="fa fa-chevron-circle-down"></i>';
    btnThinnerFrame.onclick = function (arg) {
        var frameThickness = parseInt(lblFrameThickness.textContent);
        if (frameThickness > 0)
            lblFrameThickness.textContent = (--frameThickness).toString();
        
        enableElement(btnThinnerFrame, frameThickness > me.minFrameThickness);
        enableElement(btnThickerFrame, frameThickness < me.maxFrameThickness);
    }

    var btnThickerFrame = _getById('btnThickerFrame');
    enableElement(btnThickerFrame, true);
    btnThickerFrame.innerHTML = '<i class="fa fa-chevron-circle-up"></i>';
    btnThickerFrame.onclick = function (arg) {
        var frameThickness = parseInt(lblFrameThickness.textContent);
        if (frameThickness <= me.maxFrameThickness)
            lblFrameThickness.textContent = (++frameThickness).toString();

        enableElement(btnThinnerFrame, frameThickness > me.minFrameThickness);
        enableElement(btnThickerFrame, frameThickness < me.maxFrameThickness);
    }

    // Button btnUndo
    var btnUndo = _getById('btnUndo');
    enableElement(btnUndo, false);
    btnUndo.innerHTML = '<i class="fa fa-undo" aria-hidden="true"></i> ' + TXT.Undo;
	btnUndo.onclick = function (arg) {
        if (confirm(TXT.QUndoEditing)) {
            me.callback({ undo: true });
            enableElement(btnUndo, false);
            enableElement(btnSaveEdit, false);
        }
    }

    // Button btnSaveEdit
    var btnSaveEdit = _getById('btnSaveEdit');
    enableElement(btnSaveEdit, false);
    btnSaveEdit.innerHTML = '<i class="fa fa-floppy-o" aria-hidden="true"></i> ' + TXT.Save;
	btnSaveEdit.onclick = function (arg) {
        me.callback({ saveEdit: true });
        enableElement(btnSaveEdit, false);
        enableElement(btnUndo, false);
    }

    // Swap annotation table side
    var lblPanelSwap = _getById('lblPanelSwap').textContent = TXT.PanelSwap;
    var chbPanelSwap = createAwesomePanelSwap(function () {
        var tblContent = _getById('tblContent');
        var trContent = tblContent.childNodes[1].children[0];
        var td0 = trContent.cells[0];
        trContent.removeChild(td0);
        trContent.appendChild(td0);
    });
}

Page.prototype.getViewerContainerId = function () {
	return 'seadragon-viewer';
}

Page.prototype.getViewerContainer = function () {
	return _getById('seadragon-viewer');
}

Page.prototype.getSelectionToolsInfo = function () {
	var ss = divColor.style.border.split(' ');
	
	var opacity = 0.3; //temp
	var frameColor = ss[2] + ss[3] + ss[4];
	var backgroundColor	= divColor.style.backgroundColor
											.replace('rgb', 'rgba')
											.replace(')', ',' + opacity + ')');
		
	return {
		selectedRegionTypeIndex: _getById('sltType').selectedIndex,
		frameColor:      frameColor,
		backgroundColor: backgroundColor,
        frameThickness:  parseInt(lblFrameThickness.textContent),
		opacity:         opacity
	};
}

Page.prototype.showEditTools = function (isShown) {
    for (var i = 1; i < this.tdNumber; i++)
        showElement(_getById('tdEditTools' + i.toString()), isShown);
}

Page.prototype.lockForEdit = function (isLocked) {
    showElement(_getById('chbEdit'), !isLocked);
    showElement(_getById('lblEdit'), !isLocked);
}

Page.prototype.imageListUpdated = function () {
    createAwesomedevImageListUpdate();
    showElement(this.tdImageListUpdateIndicator, true);   
}
