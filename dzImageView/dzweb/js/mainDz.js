function preMainDz() {
    theSingleton.getInstance().setLayerCollection(new LayerCollection());
    theSingleton.getInstance().setLayerCollectionPrev(new LayerCollection());

    var imageInfo = theSingleton.getInstance().getImageInfo();
    var viewer = theSingleton.getInstance().createViewer();    
    var selectedRegion = theSingleton.getInstance().getSelectedRegion();

    viewer.addHandler('update-viewport', function () {
        loopThroughAllSelectedRegions(function (selectedRegion) {
            selectedRegion.draw(viewer);
        });
    });
 
    var ss = imageInfo.Image.Url.split('/');
    theSingleton.getInstance().setImageId(ss[ss.length - 1].split('.')[0]);

    load(mainDzCallback);
    viewer.forceRedraw();
}

function mainDzCallback(arg) {
    var viewer = theSingleton.getInstance().getViewer();
    var page = theSingleton.getInstance().getPage();
    var imageId = theSingleton.getInstance().getImageId();
    var socket = theSingleton.getInstance().getSocket();
    var selectedRegion = theSingleton.getInstance().getSelectedRegion();

    if (!isUndefined(arg.isEditMode)) {
        viewer.setMouseNavEnabled(!arg.isEditMode);

        if (!arg.isEditMode) {
            viewer.forceRedraw();
            page.lockForEdit(false);
        }
    }

    if (!isUndefined(arg.polygonEnd) && !isUndefined(selectedRegion)) {
        selectedRegion.complete();
        selectedRegion.completeSelectedRegion(viewer, mainDzCallback);
    }

    if (arg.getAnnotation)
        return 'This is temporary annotation';

    if (!isUndefined(arg.edit))
        socket.emit(arg.edit ? 'beginEdit' : 'endEdit', { imageId: imageId });

    if (arg.forceRedraw)
        viewer.forceRedraw();

    if (arg.selectedRegionDeleted)
        update();

    if (!isUndefined(arg.endEditSelectedRegion)) {
        if (!arg.endEditSelectedRegion)
            theSingleton.getInstance().setSelectedRegion(undefined);

        update();
    }

    if (arg.saveEdit) {
        save(mainDzCallback);
        viewer.forceRedraw();
    }

    if (arg.undo) {
        var layerCollection = getLayerCollection();
        var layerCollectionPrev = theSingleton.getInstance().getLayerCollectionPrev();
        layerCollection.fromJSON(layerCollectionPrev);
        update();
    }

    if (arg.swap)
        update();

    if (arg.layerDeleted) {
        getLayerCollection().removeLayer(arg.layerId);
        update();
    }

    return null;
}

function update() {
    fillAnnotationTable(mainDzCallback);
    theSingleton.getInstance().getViewer().forceRedraw();
}


function mainDz() { 
    var page = new Page(mainDzCallback);
    theSingleton.getInstance().setPage(page);
	var viewerContainer = page.getViewerContainer();
	   
    viewerContainer.onclick = function (mouseEvent) {
        var viewer = theSingleton.getInstance().getViewer();			
		if (!viewer.isMouseNavEnabled()) { 
            var selectedRegion = theSingleton.getInstance().getSelectedRegion();
            if (isUndefined(selectedRegion) || selectedRegion.isReady())
                selectedRegion = SelectedRegionFactory.prototype.createSelectedRegion(page.getSelectionToolsInfo());

            var imageInfo = theSingleton.getInstance().getImageInfo();
			selectedRegion.addPoint(viewer, mainDzCallback, mouseEvent,
                imageInfo.Image.Size.Width, imageInfo.Image.Size.Height);

            theSingleton.getInstance().setSelectedRegion(selectedRegion);
		}
	}
	
    viewerContainer.onmousemove = function (mouseEvent) {	
        var viewer = theSingleton.getInstance().getViewer();		
        if (viewer.isMouseNavEnabled()) {
            var prevUpmost = theSingleton.getInstance().getPrevUpmost();
            var selectedRegion = theSingleton.getInstance().getSelectedRegion();
			var upmost;
			var zPrevUpmost = 0;
			var zUpmost = 0;
			var z = 0;
			loopThroughAllSelectedRegions(function(selectedRegion) {
				z++;
				if (prevUpmost === selectedRegion)
					zPrevUpmost = z;
				
				if (selectedRegion.isMouseOverMe(viewer, mouseEvent)) {
					upmost = selectedRegion;
					zUpmost = z;
				}
			});
			
			if (!isUndefined(prevUpmost) && !(prevUpmost === upmost)) 
				prevUpmost.drawTip(viewer, mouseEvent, zPrevUpmost < zUpmost);
			
			loopThroughAllSelectedRegions(function(selectedRegion) {
				selectedRegion.drawTip(viewer, mouseEvent, upmost === selectedRegion); 
			});
			
            theSingleton.getInstance().setPrevUpmost(upmost);
		}
	}

    var page = theSingleton.getInstance().getPage();
    var socket = theSingleton.getInstance().getSocket();
    socket
        .on('beginEdit', function (data) {
            if (theSingleton.getInstance().getImageId() === data.imageId)
	            page.lockForEdit(true);
	    })
        .on('endEdit', function (data) {
            if (theSingleton.getInstance().getImageId() === data.imageId)
	            page.lockForEdit(false);
        })
        .on('updated', function (data) {   
            // may be question whether reload        
            preMainDz();    
        })
        .on('uploadedImageName', function (data) {
            page.imageListUpdated(/*data.uploadedImageName*/);           
        });
}
