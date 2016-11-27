// Declarations of global functions implmented in Javascript
// SelectedRegion factory
var SelectedRegionFactory = (function () {
    function SelectedRegionFactory() {
    }
    SelectedRegionFactory.prototype.createSelectedRegion = function (selectionToolsInfo) {
        var typeIndex = isUndefined(selectionToolsInfo.selectedRegionTypeIndex)
            ? selectionToolsInfo
            : selectionToolsInfo.selectedRegionTypeIndex;
        switch (typeIndex) {
            case SelectedRegionType.Rectangle:
                return new SelectedRegionRectangle(selectionToolsInfo);
            case SelectedRegionType.Circle:
                return new SelectedRegionCircle(selectionToolsInfo);
            case SelectedRegionType.Polygon:
                return new SelectedRegionPolygon(selectionToolsInfo);
            default:
                return new SelectedRegionRectangle(selectionToolsInfo);
        }
    };
    return SelectedRegionFactory;
}());
var SelectedRegionType;
(function (SelectedRegionType) {
    SelectedRegionType[SelectedRegionType["Rectangle"] = 0] = "Rectangle";
    SelectedRegionType[SelectedRegionType["Circle"] = 1] = "Circle";
    SelectedRegionType[SelectedRegionType["Polygon"] = 2] = "Polygon";
})(SelectedRegionType || (SelectedRegionType = {}));
;
// SelectedRegion base class
var SelectedRegion = (function () {
    function SelectedRegion(selectionToolsInfo) {
        this.id = guid();
        this.completed = false;
        this.draw = function (viewer) {
            if (!isUndefined(this.tip))
                this.tip.forgetTipBackground();
            if (this.isShown) {
                var canvas = viewer.canvas.childNodes[0];
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = this.fillStyle;
                ctx.strokeStyle = this.strokeStyle;
                ctx.lineWidth = this.lineWidth;
                this.drawInternal(viewer, ctx);
            }
        };
        if (!isUndefined(selectionToolsInfo)) {
            this.layerId = 0;
            this.type = selectionToolsInfo.selectedRegionTypeIndex;
            this.strokeStyle = selectionToolsInfo.frameColor; //'rgb(0,0,200)';
            this.fillStyle = selectionToolsInfo.backgroundColor; //'rgba(200,0,0, 0.5)';
            this.lineWidth = selectionToolsInfo.frameThickness;
            this.isShown = true;
            this.pointImage = new Array();
            this.envelope = new Array();
        }
    }
    SelectedRegion.prototype.fromJSON = function (json) {
        if (!isUndefined(json)) {
            this.id = json.id;
            this.type = json.type;
            this.zOrder = json.zOrder;
            this.strokeStyle = json.strokeStyle;
            this.fillStyle = json.fillStyle;
            this.lineWidth = json.lineWidth;
            this.layerId = json.layerId;
            this.title = json.title;
            this.annotation = json.annotation;
            this.isShown = json.isShown;
            this.tip = new Tip(json.tip.text);
            this.pointImage = new Array(); //??
            for (var i = 0; i < json.pointImage.length; i++)
                this.pointImage.push(osdPoint(json.pointImage[i].x, json.pointImage[i].y));
            this.envelope = new Array(); //??
            for (var i = 0; i < json.envelope.length; i++)
                this.envelope.push(json.envelope[i]);
        }
    };
    SelectedRegion.prototype.pushPoint = function (point) {
        this.pointImage.push(point);
    };
    SelectedRegion.prototype.getPoint = function (i) {
        return this.pointImage[i];
    };
    SelectedRegion.prototype.numOfPoints = function () {
        return this.pointImage.length;
    };
    SelectedRegion.prototype.setEnvelope = function (env) {
        this.envelope = env;
    };
    SelectedRegion.prototype.getEnvelope = function () {
        return this.envelope;
    };
    SelectedRegion.prototype.addPoint = function (viewer, mainDzCallback, mouseEvent, imageWidth, imageHeight) {
        var imagePoint = Transform.prototype.webToImage(viewer, osdPointFromMouse(mouseEvent));
        if (imagePoint.x < 0)
            imagePoint.x = 0;
        if (imagePoint.x >= imageWidth)
            imagePoint.x = imageWidth - 1;
        if (imagePoint.y < 0)
            imagePoint.y = 0;
        if (imagePoint.y >= imageHeight)
            imagePoint.y = imageHeight - 1;
        this.pushPoint(imagePoint);
        this.drawLineWhileEdit(viewer);
        this.completeSelectedRegion(viewer, mainDzCallback);
    };
    SelectedRegion.prototype.completeSelectedRegion = function (viewer, mainDzCallback) {
        this.calcEnvelope();
        if (this.isCompleted()) {
            this.draw(viewer);
            this.define(mainDzCallback, false);
        }
    };
    SelectedRegion.prototype.calcEnvelope = function () {
        var xmin;
        var ymin;
        var xmax;
        var ymax;
        for (var i = 0; i < this.numOfPoints(); i++) {
            var ptImage = this.getPoint(i);
            if (isUndefined(xmin) || xmin > ptImage.x)
                xmin = ptImage.x;
            if (isUndefined(ymin) || ymin > ptImage.y)
                ymin = ptImage.y;
            if (isUndefined(xmax) || xmax < ptImage.x)
                xmax = ptImage.x;
            if (isUndefined(ymax) || ymax < ptImage.y)
                ymax = ptImage.y;
        }
        this.setEnvelope([xmin, ymin, xmax, ymax]);
    };
    SelectedRegion.prototype.isMouseOverMe = function (viewer, mouseEvent) {
        var isOverEnvelope = false;
        var pointImage;
        if (this.isShown) {
            var envelope = this.getEnvelope();
            if (!isUndefined(envelope)) {
                pointImage = Transform.prototype.webToImage(viewer, osdPointFromMouse(mouseEvent));
                isOverEnvelope = envelope[0] <= pointImage.x && pointImage.x <= envelope[2] &&
                    envelope[1] <= pointImage.y && pointImage.y <= envelope[3];
            }
            if (isOverEnvelope)
                return this.calcOver(pointImage);
        }
        return false;
    };
    SelectedRegion.prototype.calcOver = function (point) {
        return true;
    };
    SelectedRegion.prototype.isCompleted = function () {
        return this.completed;
    };
    SelectedRegion.prototype.complete = function () {
        this.completed = true;
    };
    SelectedRegion.prototype.drawInternal = function (vr, ctx) {
    };
    SelectedRegion.prototype.drawLineWhileEdit = function (vr) {
    };
    SelectedRegion.prototype.define = function (mainDzCallback, isEditOne) {
        var me = this;
        this.pageDefinition = new PageDefSelReg(this.layerId, this.id, this.title, this.annotation, function (arg) {
            if (isUndefined(me))
                return;
            me.pageDefinition = undefined;
            var isNew = !me.isNotEmptyString(me.title);
            if (isNew || isEditOne) {
                me.title = arg.title;
                me.tip = new Tip(me.title);
                if (me.isNotEmptyString(arg.annotation))
                    me.annotation = arg.annotation;
                console.log(me.id);
                var layer = getLayerCollection().addLayerIfNotExists(new Layer(arg.layerTitle));
                if (me.layerId != layer.id) {
                    var oldLayer = getLayerCollection().getLayerById(me.layerId);
                    if (!isUndefined(oldLayer))
                        oldLayer.removeSelectedRegion(me.id);
                    me.layerId = layer.id;
                    layer.selectedRegions.push(me);
                }
                me.zOrder = layer.zOrderCount++;
                mainDzCallback({ endEditSelectedRegion: true });
            }
        }, function (arg) {
            mainDzCallback({ endEditSelectedRegion: false });
            me = undefined;
        });
    };
    SelectedRegion.prototype.isReady = function () {
        return this.layerId > 0;
    };
    SelectedRegion.prototype.drawTip = function (viewer, mouseEvent, toDraw) {
        if (!isUndefined(this.tip)) {
            //console.log('selectedRegion.drawTip: mouse(' + mouseEvent.x + ',' + mouseEvent.y + ')'); //TEST
            this.tip.draw(viewer, mouseEvent, toDraw);
        }
    };
    SelectedRegion.prototype.cleanBeforeSave = function () {
        this.tip.forgetTipBackground();
    };
    SelectedRegion.prototype.showHide = function (checked) {
        this.isShown = checked;
    };
    SelectedRegion.prototype.edit = function (mainDzCallback) {
        this.define(mainDzCallback, true);
    };
    SelectedRegion.prototype.delete = function (mainDzCallback) {
        getLayerCollection().getLayerById(this.layerId).removeSelectedRegion(this.id);
        mainDzCallback({ selectedRegionDeleted: true });
    };
    SelectedRegion.prototype.isNotEmptyString = function (s) {
        return !isUndefined(s) && typeof s === 'string' && s.length > 0;
    };
    return SelectedRegion;
}());
//# sourceMappingURL=selectedRegion.js.map