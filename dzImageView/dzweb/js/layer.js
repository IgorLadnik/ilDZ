function Layer (title) {
	this.title = title;
	this.id;
	this.zOrderCount = 0;
	this.selectedRegions = [];
}

Layer.prototype.fromJSON = function (json) {
    this.title = json.title;
    this.id = json.id;
    this.zOrderCount = json.zOrderCount;
    this.selectedRegions = [];

    for (var i = json.selectedRegions.length - 1; i >= 0; i--) {
        var selectedRegion = SelectedRegionFactory.prototype.createSelectedRegion(json.selectedRegions[i].type);
        selectedRegion.fromJSON(json.selectedRegions[i]);
        this.selectedRegions.push(selectedRegion);

        if (selectedRegion.zOrder > this.zOrderCount)
            this.zOrderCount = selectedRegion.zOrder;
    }

    this.sortSelectedRegions();
}

Layer.prototype.sortSelectedRegions = function (selectedRegionId) {
    this.selectedRegions.sort(function (a, b) {
        if (a.zOrder > b.zOrder)
            return 1;

        return -1;
    });
}

Layer.prototype.removeSelectedRegion = function (selectedRegionId) {
    var tempArr = [];
    this.selectedRegions.forEach(function (sr) {
        if (sr.id != selectedRegionId)
            tempArr.push(sr);
    });

    this.selectedRegions = tempArr;
    this.sortSelectedRegions();
}

Layer.prototype.edit = function (mainDzCallback) {
    var me = this;
    var pageDefinition = new PageDefLayer(this.id, this.title,
        function (arg) { // Save
            me.title = arg.layerTitle;
            fillAnnotationTable(mainDzCallback);
        }); 
}

Layer.prototype.delete = function (mainDzCallback) {
    mainDzCallback({ layerDeleted: true, layerId: this.id });
}
