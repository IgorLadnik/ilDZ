var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SelectedRegionPolygon = (function (_super) {
    __extends(SelectedRegionPolygon, _super);
    function SelectedRegionPolygon(selectionToolsInfo) {
        _super.call(this, selectionToolsInfo);
    }
    // After http://jsfromhell.com/math/is-point-in-poly ->
    // Checks whether a point is inside a polygon. 
    // Adapted from: [http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html] 
    // Created: 2008.03.14
    SelectedRegionPolygon.prototype.calcOver = function (pt) {
        for (var c = false, i = -1, l = this.numOfPoints(), j = l - 1; ++i < l; j = i)
            ((this.getPoint(i).y <= pt.y && pt.y < this.getPoint(j).y) ||
                (this.getPoint(j).y <= pt.y && pt.y < this.getPoint(i).y))
                && (pt.x < (this.getPoint(j).x - this.getPoint(i).x) * (pt.y - this.getPoint(i).y) /
                    (this.getPoint(j).y - this.getPoint(i).y) + this.getPoint(i).x)
                && (c = !c);
        return c;
    };
    SelectedRegionPolygon.prototype.drawInternal = function (vr, ctx) {
        ctx.beginPath();
        for (var i = 0; i < this.numOfPoints(); i++) {
            var ptWeb = Transform.prototype.imageToWeb(vr, this.getPoint(i));
            if (i === 0)
                ctx.moveTo(ptWeb.x, ptWeb.y);
            else
                ctx.lineTo(ptWeb.x, ptWeb.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };
    SelectedRegionPolygon.prototype.drawLineWhileEdit = function (vr) {
        var canvas = vr.canvas.childNodes[0];
        var ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (var i = 0; i < this.numOfPoints(); i++) {
            var ptWeb = Transform.prototype.imageToWeb(vr, this.getPoint(i));
            if (i === 0)
                ctx.moveTo(ptWeb.x, ptWeb.y);
            else
                ctx.lineTo(ptWeb.x, ptWeb.y);
        }
        ctx.stroke();
    };
    return SelectedRegionPolygon;
}(SelectedRegion));
//# sourceMappingURL=selectedRegionPolygon.js.map