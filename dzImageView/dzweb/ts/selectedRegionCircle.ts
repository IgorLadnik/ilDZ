class SelectedRegionCircle extends SelectedRegion {
	private ptWebCenter: any;
	private radiusSqr: number;

    constructor(selectionToolsInfo: any) {
        super(selectionToolsInfo); 
    }

    public fromJSON(json: any) {
        if (!isUndefined(json)) {
            super.fromJSON(json);

            if (!isUndefined(json.ptWebCenter))
                this.ptWebCenter = osdPoint(json.ptWebCenter.x, json.ptWebCenter.y);

            if (!isUndefined(json.radiusSqr))
                this.radiusSqr = json.radiusSqr;
        }
    }
	
	public isCompleted(): boolean {
		return this.numOfPoints() === 2;
	}
	
	public isMouseOverMe(viewer: any, mouseEvent: any): boolean {
		var isOverEnvelope = false;
		if (this.isShown) {						
			var pointWeb = osdPointFromMouse(mouseEvent);				
			return this.getRadiusSqr(this.ptWebCenter, pointWeb) <= this.radiusSqr;
		}
		
		return false;
	}
	
	public drawInternal(vr: any, ctx: any) {
		var ptImageCenter = this.getPoint(0);	
		var ptImage = this.getPoint(1);
		this.ptWebCenter = Transform.prototype.imageToWeb(vr, osdPoint(ptImageCenter.x, ptImageCenter.y));
		var ptWeb = Transform.prototype.imageToWeb(vr, osdPoint(ptImage.x, ptImage.y));
		this.radiusSqr = this.getRadiusSqr(this.ptWebCenter, ptWeb);
		var rSqr: any = this.radiusSqr;
		
		ctx.beginPath();
		ctx.arc(this.ptWebCenter.x, this.ptWebCenter.y, Math.sqrt(rSqr), 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	}
	
	private getRadiusSqr(ptWebCenter: any, pt: any): number {
		var dX = pt.x - ptWebCenter.x;
		var dY = pt.y - ptWebCenter.y;
		return dX * dX + dY * dY;
	}
}
