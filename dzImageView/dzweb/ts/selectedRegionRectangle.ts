class SelectedRegionRectangle extends SelectedRegion {
	
    constructor(selectionToolsInfo: any) {
		super(selectionToolsInfo);
    }
	
	public isCompleted(): boolean {
		return this.numOfPoints() === 2;
	}
	
	public drawInternal(vr: any, ctx: any) {
		var envelope = this.getEnvelope();
		var ptWebLT = Transform.prototype.imageToWeb(vr, osdPoint(envelope[0], envelope[1]));
		var ptWebRB = Transform.prototype.imageToWeb(vr, osdPoint(envelope[2], envelope[3]));
							
		var width = ptWebRB.x - ptWebLT.x;
		var height = ptWebRB.y - ptWebLT.y;
		ctx.fillRect(ptWebLT.x, ptWebLT.y, width, height);
		ctx.strokeRect(ptWebLT.x, ptWebLT.y, width, height);		
    }
}
