function PageDefLayer(layerId, layerTitle, layerCallbackSave) {
	
	var divMain = _getById('divMain');
	var divSelectionRegionDefinition = _getById('divSelectionRegionDefinition');
	var btnSave = _getById('btnSave');
	var btnCancel = _getById('btnCancel');
	var lblLayer = _getById('lblLayer');

    showElement(_getById('sltLayer'), false);
	showElement(_getById('lblTitle'), false);
	showElement(_getById('txtTitle'), false);
	showElement(_getById('lblAnnotation'), false);
	showElement(_getById('txaAnnotation'), false);

	lblLayer.innerText = TXT.Layer;
	btnSave.innerText = TXT.Save;
	btnCancel.innerText = TXT.Cancel;
		
	divMain.className = 'disabled';
	showElement(divSelectionRegionDefinition, true);
        
    var txtLayer = _getById('txtNewLayer');
    showElement(txtLayer, true);
    txtLayer.value = layerTitle;
	showElement(_getById('btnNewLayer'), false);

    enableElement(btnSave, false);
    txtLayer.onkeyup = function () {
    	enableElement(btnSave, txtLayer.value.length > 0 && txtLayer.value != layerTitle);
	}
   
	btnSave.onclick = function() {			
        showElement(divSelectionRegionDefinition, false);

        enableElement(_getById('btnUndo'), true);
        enableElement(_getById('btnSaveEdit'), true);

		divMain.className = '';

		layerCallbackSave({		            
                    layerTitle: txtLayer.value,
				});
	}

	btnCancel.onclick = function () {
        showElement(divSelectionRegionDefinition, false);
        divMain.className = '';
    }
}
