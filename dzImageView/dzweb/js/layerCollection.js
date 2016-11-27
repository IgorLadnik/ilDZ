function LayerCollection() {
    this.count = 0;
    this.layers = [];  
}

LayerCollection.prototype.getIncrementedCount = function () {
    return ++this.count;
}

LayerCollection.prototype.fromJSON = function (json) {
    this.count = json.count;
    this.layers = [];

    for (var i = json.layers.length - 1; i >= 0; i--) {
        var layer = new Layer(json.layers[i].title);
        layer.fromJSON(json.layers[i]);
        this.layers.push(layer);
    }

    this.sortLayers();
}

LayerCollection.prototype.sortLayers = function (layerTitle) {
    this.layers.sort(function (a, b) {
        if (a.id > b.id)
            return 1;

        return -1;
    });
}

LayerCollection.prototype.getLayerByTitle = function (layerTitle) {
    if (this.layers.length > 0)
        for (var i = 0; i < this.layers.length; i++)
            if (layerTitle === this.layers[i].title)
                return this.layers[i];

    return undefined;
}

LayerCollection.prototype.getLayerById = function (layerId) {
    if (this.layers.length > 0)
        for (var i = 0; i < this.layers.length; i++)
            if (layerId === this.layers[i].id)
                return this.layers[i];

    return undefined;
}

LayerCollection.prototype.addLayerIfNotExists = function (layer) {
    var existingLayer = this.getLayerByTitle(layer.title);
    if (isUndefined(existingLayer)) {
        layer.id = this.getIncrementedCount();
        this.layers.push(layer);
        existingLayer = layer;
    }

    this.sortLayers();

    return existingLayer;
}

LayerCollection.prototype.removeLayer = function (layerId) {
    var arr = [];
    if (this.layers.length > 0)
        for (var i = 0; i < this.layers.length; i++)
            if (layerId !== this.layers[i].id)
                arr.push(this.layers[i]);

    this.layers = arr;

    this.sortLayers();
}



