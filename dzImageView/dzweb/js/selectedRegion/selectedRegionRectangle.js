var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SelectedRegionRectangle = (function (_super) {
    __extends(SelectedRegionRectangle, _super);
    function SelectedRegionRectangle(selectionToolsInfo) {
        _super.call(this, selectionToolsInfo);
    }
    SelectedRegionRectangle.prototype.isCompleted = function () {
        return this.numOfPoints() === 2;
    };
    SelectedRegionRectangle.prototype.drawInternal = function (vr, ctx) {
        var envelope = this.getEnvelope();
        var ptWebLT = Transform.prototype.imageToWeb(vr, osdPoint(envelope[0], envelope[1]));
        var ptWebRB = Transform.prototype.imageToWeb(vr, osdPoint(envelope[2], envelope[3]));
        var width = ptWebRB.x - ptWebLT.x;
        var height = ptWebRB.y - ptWebLT.y;
        ctx.fillRect(ptWebLT.x, ptWebLT.y, width, height);
        ctx.strokeRect(ptWebLT.x, ptWebLT.y, width, height);
    };
    return SelectedRegionRectangle;
}(SelectedRegion));
//# sourceMappingURL=selectedRegionRectangle.js.map