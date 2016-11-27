var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SelectedRegionCircle = (function (_super) {
    __extends(SelectedRegionCircle, _super);
    function SelectedRegionCircle(selectionToolsInfo) {
        _super.call(this, selectionToolsInfo);
    }
    SelectedRegionCircle.prototype.fromJSON = function (json) {
        if (!isUndefined(json)) {
            _super.prototype.fromJSON.call(this, json);
            if (!isUndefined(json.ptWebCenter))
                this.ptWebCenter = osdPoint(json.ptWebCenter.x, json.ptWebCenter.y);
            if (!isUndefined(json.radiusSqr))
                this.radiusSqr = json.radiusSqr;
        }
    };
    SelectedRegionCircle.prototype.isCompleted = function () {
        return this.numOfPoints() === 2;
    };
    SelectedRegionCircle.prototype.isMouseOverMe = function (viewer, mouseEvent) {
        var isOverEnvelope = false;
        if (this.isShown) {
            var pointWeb = osdPointFromMouse(mouseEvent);
            return this.getRadiusSqr(this.ptWebCenter, pointWeb) <= this.radiusSqr;
        }
        return false;
    };
    SelectedRegionCircle.prototype.drawInternal = function (vr, ctx) {
        var ptImageCenter = this.getPoint(0);
        var ptImage = this.getPoint(1);
        this.ptWebCenter = Transform.prototype.imageToWeb(vr, osdPoint(ptImageCenter.x, ptImageCenter.y));
        var ptWeb = Transform.prototype.imageToWeb(vr, osdPoint(ptImage.x, ptImage.y));
        this.radiusSqr = this.getRadiusSqr(this.ptWebCenter, ptWeb);
        var rSqr = this.radiusSqr;
        ctx.beginPath();
        ctx.arc(this.ptWebCenter.x, this.ptWebCenter.y, Math.sqrt(rSqr), 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    };
    SelectedRegionCircle.prototype.getRadiusSqr = function (ptWebCenter, pt) {
        var dX = pt.x - ptWebCenter.x;
        var dY = pt.y - ptWebCenter.y;
        return dX * dX + dY * dY;
    };
    return SelectedRegionCircle;
}(SelectedRegion));
//# sourceMappingURL=selectedRegionCircle.js.map