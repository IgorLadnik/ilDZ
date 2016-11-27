var theSingleton = (function() {

    // Instance stores a reference to the Singleton
    var _instance;
    var _socket;
    var _viewer;
    var _page;
    var _imageId;
    var _imageInfo;
    var _prevUpmost;
    var _selectedRegion;
    var _layerCollection;
    var _layerCollectionPrev;
    var _mainDzCallback;

    function init() {

        return {
             createViewer: function () {
                 if (!isUndefined(_viewer))
                     _viewer.destroy();

                 _viewer = OpenSeadragon({
                     id: Page.prototype.getViewerContainerId(),
                     prefixUrl: 'openseadragon/images/',
                     tileSources: _imageInfo.Image.Url,
                 });

                 return _viewer;
             },
             getViewer: function() {
                 return _viewer;
             },

             setSocket: function (socket) {
                 _socket = socket;
             },
             getSocket: function () {
                 return _socket;
             },

             setPrevUpmost: function (prevUpmost) {
                 _prevUpmost = prevUpmost;
             },
             getPrevUpmost: function() {
                 return _prevUpmost;
             },

             setImageInfo: function (imageInfo) {
                 _imageInfo = imageInfo;
             },
             getImageInfo: function () {
                 return _imageInfo;
             },

             setPage: function (page) {
                 _page = page;
             },
             getPage: function () {
                 return _page;
             },

             setImageId: function (imageId) {
                 _imageId = imageId;
             },
             getImageId: function () {
                 return _imageId;
             },

             setSelectedRegion: function (selectedRegion) {
                 _selectedRegion = selectedRegion;
             },
             getSelectedRegion: function () {
                 return _selectedRegion;
             },

             setLayerCollection: function (layerCollection) {
                 _layerCollection = layerCollection;
             },
             getLayerCollection: function () {
                 return _layerCollection;
             },

             setLayerCollectionPrev: function (layerCollectionPrev) {
                 _layerCollectionPrev = layerCollectionPrev;
             },
             getLayerCollectionPrev: function () {
                 return _layerCollectionPrev;
             },

             setMainDzCallback: function (mainDzCallback) {
                 _mainDzCallback = mainDzCallback;
             },
             getMainDzCallback: function () {
                 return _mainDzCallback;
             },
        };
    }   

    return {

        // Get the Singleton instance if one exists
        //   or create one if it doesn't
        getInstance: function() {

            if (isUndefined(_instance)) 
                _instance = init();

            return _instance;
        }
    };
})();
