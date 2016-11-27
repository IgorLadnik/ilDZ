// '$x' will be replaced by server

const hostIPAddress = '$0';
const __isRightLayout = $1;


// Global Functions

var isUndefined = function (a) {
    return a === undefined;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function osdPoint(x, y) {
    return new OpenSeadragon.Point(x, y);
}

function webFromMouse(mouseEvent) {
    var viewerOffset = getViewerOffset();
    return {
        //x: mouseEvent.clientX - mouseEvent.currentTarget.offsetLeft - viewerOffset.x, 
        //y: mouseEvent.clientY - mouseEvent.currentTarget.offsetTop - viewerOffset.y

        x: mouseEvent.layerX,// - mouseEvent.currentTarget.offsetLeft,
        y: mouseEvent.layerY// - mouseEvent.currentTarget.offsetTop
    };
}

function osdPointFromMouse(mouseEvent) {
    var pointWeb = webFromMouse(mouseEvent);
    return new OpenSeadragon.Point(pointWeb.x, pointWeb.y);
}

function getLayerCollection() {
    return theSingleton.getInstance().getLayerCollection();
}

function loopThroughAllSelectedRegions(callback) {
    var layers = getLayerCollection().layers;
    if (layers.length > 0) {
        for (var i = 0; i < layers.length; i++) {
            var selectedRegions = layers[i].selectedRegions;
            for (var j = 0; j < selectedRegions.length; j++)
                callback(selectedRegions[j]);
        }
    }
}

// Start of execution
function startUp() {
    theSingleton.getInstance().setSocket(io.connect(hostIPAddress, { secure: true }));
    
    exchangeWithServer('init', { imageNumber: '1' },
                       function (arg) {
                           var init = new PageInit(arg.imageNames, getImageInfo);
                       });
}

function getImageInfo(imageName) {
    if (!isUndefined(imageName)) {
        exchangeWithServer('imageInfo', { imageName: imageName },
            function (arg) {
                var imageInfo = theSingleton.getInstance().getImageInfo();
                var isStartup = isUndefined(imageInfo);
                theSingleton.getInstance().setImageInfo(arg.imageInfo);

                preMainDz();

                if (isStartup)
                    mainDz();

                theSingleton.getInstance().getPage().lockForEdit(!arg.isEditable);
            });
    }
    else
        mainDz();
}

function save(mainDzCallback) {
    // Cleaning before save
    loopThroughAllSelectedRegions(function (selectedRegion) {
        selectedRegion.cleanBeforeSave();
    });

    fillAnnotationTable(mainDzCallback);

    var layerCollectionPrev = theSingleton.getInstance().getLayerCollectionPrev();
    var layerCollection = theSingleton.getInstance().getLayerCollection();
    layerCollectionPrev.fromJSON(layerCollection); //??

    var imageId = theSingleton.getInstance().getImageId();
    exchangeWithServer('save', { imageId: imageId, layerCollection: layerCollection },
                       function (jsonResponse) { alert(jsonResponse.result); });
}

function load(mainDzCallback) {
    var imageId = theSingleton.getInstance().getImageId();
    exchangeWithServer('load', { imageId: imageId },
                       function (jsonResponse) {

                           if (jsonResponse.content != '') {
                               var layerCollection = getLayerCollection();
                               layerCollection.fromJSON(jsonResponse.content);
                               var layerCollectionPrev = theSingleton.getInstance().getLayerCollectionPrev();
                               layerCollectionPrev.fromJSON(jsonResponse.content);
                           }
                           else {
                               theSingleton.getInstance().setLayerCollection(new LayerCollection());
                               theSingleton.getInstance().setLayerCollectionPrev(new LayerCollection());
                           }

                           fillAnnotationTable(mainDzCallback);
                       });
}

function exchangeWithServer(messageName, objToSend, processDataFromServer) {
    new Promise(function (resolve, reject) {
        var socket = theSingleton.getInstance().getSocket();
        socket.on(messageName, function (dataFromServer) {
            resolve(dataFromServer);
        });

        try {
            socket.emit(messageName, objToSend);
        }
        catch (err) {
            reject(err);
        }
    })
	.then(function (jsonObjFromServer) {
	            try {
	                processDataFromServer(jsonObjFromServer);
	            }
	            catch (err) {
	                alert(err);
	            }

	        },
	      function (err) { alert(err); });
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};




