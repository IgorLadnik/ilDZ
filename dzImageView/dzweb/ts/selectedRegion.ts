// Declarations of global functions implmented in Javascript

declare function isUndefined(ob: any): boolean;
declare function guid(): string;
declare function Tip(text: string): void;
declare function Layer(text: string): void;
declare function Transform(): void;
declare function PageDefSelReg(layerId: number,
                               selectedRegionId: string,
			                   title: string, 
							   annotation: string, 
                               funcSave: any,
                               funcCancel): void;
declare function osdPoint(x: number, y: number): any;
declare function osdPointFromMouse(mouseEvent: any): any;
declare function getLayerCollection();


// SelectedRegion factory

class SelectedRegionFactory {
    public createSelectedRegion(selectionToolsInfo: any) {

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
    }
}


enum SelectedRegionType {
	Rectangle = 0,
	Circle = 1,
	Polygon = 2,
};


// SelectedRegion base class

class SelectedRegion {
	public id: string = guid();
    public type: SelectedRegionType;
    public zOrder: number;
	public strokeStyle: string;
	public fillStyle: string;	
	public lineWidth: number;
	public layerId: number;
	public title: string
	public annotation: string;
	public isShown: boolean;
	public tip: any; //Tip;
	public pageDefinition: any; // PageDefinition
	
	private pointImage: Array<any/*OpenSeadragon.Point*/>;
	private envelope: Array<number>;
    private completed: boolean = false;
	
    constructor(selectionToolsInfo: any) {
        if (!isUndefined(selectionToolsInfo)) {
            this.layerId = 0;
            this.type = selectionToolsInfo.selectedRegionTypeIndex;
            this.strokeStyle = selectionToolsInfo.frameColor; //'rgb(0,0,200)';
            this.fillStyle = selectionToolsInfo.backgroundColor; //'rgba(200,0,0, 0.5)';
            this.lineWidth = selectionToolsInfo.frameThickness;
            this.isShown = true;
            this.pointImage = new Array<any>();
            this.envelope = new Array<number>();
        }
	}
	
    public fromJSON(json: any) {
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

            this.pointImage = new Array<any>(); //??
            for (var i = 0; i < json.pointImage.length; i++)
                this.pointImage.push(osdPoint(json.pointImage[i].x, json.pointImage[i].y));

            this.envelope = new Array<number>(); //??
            for (var i = 0; i < json.envelope.length; i++)
                this.envelope.push(json.envelope[i]);
        }
	}
	
	public pushPoint(point) {
		this.pointImage.push(point);
	}
	
	public getPoint(i): any /*OpenSeadragon.Point*/{
		return this.pointImage[i];
	}
	
	public numOfPoints(): number {
		return this.pointImage.length;
	}
	
	public setEnvelope(env: Array<number>) {
		this.envelope = env;
	}
	
	public getEnvelope(): Array<number> {
		return this.envelope;
	}
	
    public addPoint(viewer: any, mainDzCallback: any, mouseEvent: any, imageWidth: number, imageHeight: number) {
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
	}
	
	public completeSelectedRegion(viewer: any, mainDzCallback: any) {
		this.calcEnvelope();
		
		if (this.isCompleted()) {
            this.draw(viewer);
            this.define(mainDzCallback, false);
		}
	}
	
	public calcEnvelope() {
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
	}

	public isMouseOverMe(viewer: any, mouseEvent: any): boolean {
		var isOverEnvelope = false;
		var pointImage;
		if (this.isShown) {
			var envelope = this.getEnvelope();
			if	(!isUndefined(envelope)) {							
				pointImage = Transform.prototype.webToImage(viewer, osdPointFromMouse(mouseEvent));				
								
				isOverEnvelope = envelope[0] <= pointImage.x && pointImage.x <= envelope[2] &&
					             envelope[1] <= pointImage.y && pointImage.y <= envelope[3];
			}	
			
			if (isOverEnvelope)
				return this.calcOver(pointImage);
		}
		
		return false;
	}
	
	public calcOver(point: any): boolean {
		return true;
	}
	
	public isCompleted(): boolean {
		return this.completed;
	}
	
	public complete() {
		this.completed = true;
	}
	
	public draw = function(viewer: any) {
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
	}
	
	public drawInternal(vr: any, ctx: any) {
    }

    public drawLineWhileEdit(vr: any) {
    }

    private define(mainDzCallback: any, isEditOne: boolean) {
		var me = this;

        this.pageDefinition = new PageDefSelReg(this.layerId, this.id, this.title, this.annotation,	
            function (arg) {	// Save	
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
            },
            function (arg) { //Cancel
                mainDzCallback({ endEditSelectedRegion: false });
                me = undefined;
            }
        );	
	}
	
	public isReady() {
		return this.layerId > 0;
	}

	public drawTip(viewer: any, mouseEvent: any, toDraw: boolean) {
        if (!isUndefined(this.tip)) {
            //console.log('selectedRegion.drawTip: mouse(' + mouseEvent.x + ',' + mouseEvent.y + ')'); //TEST
            this.tip.draw(viewer, mouseEvent, toDraw);
        }
    }

    public cleanBeforeSave() {
        this.tip.forgetTipBackground();
    }

    public showHide(checked: boolean) {
        this.isShown = checked;
    }

    public edit(mainDzCallback: any) {
        this.define(mainDzCallback, true);
    }

    public delete(mainDzCallback: any) {
        getLayerCollection().getLayerById(this.layerId).removeSelectedRegion(this.id);
        mainDzCallback({ selectedRegionDeleted: true });
    }

    public isNotEmptyString(s: any): boolean {
        return !isUndefined(s) && typeof s === 'string' && s.length > 0;
    }
}

