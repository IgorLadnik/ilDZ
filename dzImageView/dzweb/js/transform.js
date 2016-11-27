function Transform() {
}

Transform.prototype.webToImage = function (viewer, webPoint) {
	var vpt = viewer.viewport;
	return vpt.viewportToImageCoordinates(vpt.pointFromPixel(webPoint));
}
	
Transform.prototype.imageToWeb = function (viewer, imagePoint) {
	var vpt = viewer.viewport;
	var ptWeb = vpt.pixelFromPoint(vpt.imageToViewportCoordinates(imagePoint), 
					true); //true - !!! https://github.com/openseadragon/openseadragon/issues/864
			
	return osdPoint(ptWeb.x, ptWeb.y);
}

