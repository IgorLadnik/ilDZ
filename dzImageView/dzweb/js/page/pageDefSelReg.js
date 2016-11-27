function PageDefSelReg(layerId,
                       selectedRegionId,
		               title,
                       annotation,
		               selectedRegionCallbackSave,
                       selectedRegionCallbackCancel) {
	
	var divMain = _getById('divMain');
	var divSelectionRegionDefinition = _getById('divSelectionRegionDefinition');
	var btnSave = _getById('btnSave');
	var btnCancel = _getById('btnCancel');
	var lblLayer = _getById('lblLayer');
	var sltLayer = _getById('sltLayer');
	var lblTitle = _getById('lblTitle');
	var txtTitle = _getById('txtTitle');
	var lblAnnotation = _getById('lblAnnotation');
	var txaAnnotation = _getById('txaAnnotation');

	showElement(lblTitle, true);
	showElement(txtTitle, true);
	showElement(lblAnnotation, true);
	showElement(txaAnnotation, true);

    lblLayer.innerText = TXT.Layer;
    lblTitle.innerText = TXT.Title;
	btnSave.innerText = TXT.Save;
    btnCancel.innerText = TXT.Cancel;
    lblAnnotation.innerText = TXT.Annotation;

	txaAnnotation.value = isUndefined(annotation) ? '' : annotation;
	
	txtTitle.value = isUndefined(title) ? '' : title;

	enableElement(btnSave, false);

    sltLayer.onclick = function () {
	    enableElement(btnSave, true);
    }

    txaAnnotation.onkeyup = function () {
        enableElement(btnSave, true);
    }

	txtTitle.onkeyup = function () {
	    enableElement(btnSave, txtTitle.value.length > 0);
	}

	txtNewLayer.onkeyup = function () {
	    if (btnNewLayer.innerText === TXT.Cancel)
	        enableElement(btnSave, txtNewLayer.value.length > 0);
	}
	
	divMain.className = 'disabled';
	showElement(divSelectionRegionDefinition, true);

	var theLayerTitle;
    var layer = getLayerCollection().getLayerById(layerId);
	if (!isUndefined(layer)) {
	    theLayerTitle = layer.title;
	}

	var theLayerIndex = 0;
    layerTitles = [];
    var layerCollection = getLayerCollection();
    for (var i = 0; i < layerCollection.layers.length; i++) {
	    var lr = layerCollection.layers[i];
	    layerTitles.push(lr.title);

	    if (theLayerTitle === lr.title)
	        theLayerIndex = i;
	}

	initSelectElement(sltLayer, layerTitles, function (arg) {

	});

	sltLayer.selectedIndex = theLayerIndex;

	txtNewLayer = _getById('txtNewLayer');
	btnNewLayer = _getById('btnNewLayer');
	
	var areLayers = layerTitles.length > 0;
	btnNewLayer.innerText = areLayers ? TXT.NewLayer : TXT.Cancel;
	showElement(btnNewLayer, true);
	showElement(sltLayer, areLayers);
	showElement(txtNewLayer, !areLayers);
    
	btnNewLayer.onclick = function () {
        if (btnNewLayer.innerText === TXT.NewLayer) {
			btnNewLayer.innerText = TXT.Cancel;
			showElement(sltLayer, false);
			showElement(txtNewLayer, true);
            lblLayer.innerText = TXT.NewLayer;
			txtNewLayer.value = '';
			enableElement(btnSave, false);
		}
		else {
            btnNewLayer.innerText = TXT.NewLayer;			
			showElement(sltLayer, true);
			showElement(txtNewLayer, false);
			lblLayer.innerText = TXT.Layer;
		}
	}
	   
	btnSave.onclick = function() {			
		var layerTitle;
		
		var isNewLayer = false;
        var toBeSaved = true;

        enableElement(_getById('btnUndo'), true);
        enableElement(_getById('btnSaveEdit'), true);

        if (btnNewLayer.innerText === TXT.NewLayer)
		    // Selection of existing layer
		    layerTitle = sltLayer.options[sltLayer.selectedIndex].text;
		else {
		    // New Layer case
		    layerTitle = txtNewLayer.value;

		    if (layerTitle.length > 0) {
		        isNewLayer = true;

		        for (var i = 0; i < sltLayer.options.length; i++) {
		            if (layerTitle === sltLayer.options[i].text) {
		                toBeSaved = false;
                        if (confirm(TXT.QLayerExists)) {
		                    isNewLayer = false;
		                    toBeSaved = true;
		                }

		                break;
		            }
		        }
		    }
		    else {
                alert(TXT.SelectInsertLayer);
		        toBeSaved = false;
		    }
		}

		if (toBeSaved) 
		    if (txtTitle.value.length == 0) {
                alert(TXT.InsertSR);
		        toBeSaved = false;
		    }

		if (toBeSaved) {
		    showElement(divSelectionRegionDefinition, false);
		    divMain.className = '';

		    selectedRegionCallbackSave({
		        isNewLayer: isNewLayer,
		        layerTitle: layerTitle,
		        selectedRegionId: selectedRegionId,
		        title: txtTitle.value,
		        annotation: txaAnnotation.value
		    });
		}
	}

	btnCancel.onclick = function () {
        showElement(divSelectionRegionDefinition, false);
        divMain.className = '';
        selectedRegionCallbackCancel({
            selectedRegionId: selectedRegionId
        });
    }
}

