function Tip(text) {
	this.back;
	this.xold;
	this.yold;
    this.text = text;
    this.isTimeout = false;  //1
    this.timeoutInSec = 10;  //1
}

Tip.prototype.draw = function (viewer, mouseEvent, isMouseOverMe) {
    var me = this;
    var canvas = viewer.canvas.childNodes[0];
    var ctx = canvas.getContext('2d');

    //TEST
    //var ptest = webFromMouse(mouseEvent);
    //console.log('tip: mouse(' + mouseEvent.x + ',' + mouseEvent.y + ') - ' + 
    //            'webFromMouse(' + ptest.x + ',' +  ptest.y + ')');
	
    // Restore previous rectangle
    this.restore(ctx);
    
	if (isMouseOverMe) {
        ctx.fillStyle = TIP.Background;
		ctx.strokeStyle =  TIP.FrameColor;
		ctx.lineWidth = 3;
		
		const d = 6;
		
		const fontHeight = 12;
		const margin = 5;
			
		var pointWeb = osdPointFromMouse(mouseEvent);
		var xptr = pointWeb.x;
		var yptr = pointWeb.y;
			
		ctx.font = fontHeight.toString() + 'px Arial';
		var textSize = ctx.measureText(this.text);
		
		var width = textSize.width + margin * 2;
		var height = fontHeight + margin * 2;
		
		var x = xptr - width / 2;
		var y = yptr - height - d;	

        theSingleton.getInstance().getImageInfo().Image.Size.Height

        // Not to show tip close to the edge of viewport (show only fully written tip).
        var viewportSize = theSingleton.getInstance().getViewer().viewport._containerInnerSize;
        if (x - d > 0 && y - d > 0 && 
            x + width + d < viewportSize.x && y + height + d + /*some delta*/5 < viewportSize.y) {
			
		    // Save the initial background.
		    this.back = ctx.getImageData(x - d, y - d, width + 2 * (d + 1), height + 2 * (d + 1));
		    //console.log('>>>ctx.getImageData: (' + (x - d) + ', ' + (y - d) + ') ' + '  w=' + this.back.width + ' h=' + this.back.height); //TEST
		
		    ctx.beginPath();
		    ctx.moveTo(x, y);
		    ctx.lineTo(x + width, y);
		    ctx.lineTo(x + width, y + height);
		    ctx.lineTo(x + width / 2 + d, y + height);
		    ctx.lineTo(xptr, yptr);
		    ctx.lineTo(x + width / 2 - d, y + height);
		    ctx.lineTo(x, y + height);
		    ctx.lineTo(x, y);
			
		    ctx.fill();
		    ctx.stroke();
		    ctx.closePath();
			
            ctx.fillStyle = TIP.Color;
		    ctx.fillText(this.text, x + margin, y + margin + fontHeight - 1, textSize.width);
							
		    this.xold = x - d;
            this.yold = y - d;

            // Mechanism to hide tip after timeout (set to 10s)
            this.isTimeout = true;          //1
            setTimeout(function () {        //1
                if (me.isTimeout)           //1
                    me.restore(ctx);        //1
            }, this.timeoutInSec * 1000);   //1

		 }
		 else
		    this.forgetTipBackground();
	}
}

Tip.prototype.restore = function (ctx) {
    // Restore previous rectangle
    if (this.isRestorable()) {
        ctx.putImageData(this.back, this.xold, this.yold);
        //console.log('<<<ctx.putImageData: (' + this.xold + ', ' + this.yold + ') ' + '  w=' + this.back.width + ' h=' + this.back.height); //TEST
        this.forgetTipBackground();
    }

    this.isTimeout = false;
}

Tip.prototype.forgetTipBackground = function () {
    this.back = undefined;
    this.xold = undefined;
    this.yold = undefined;
}

Tip.prototype.isRestorable = function () {
    return !isUndefined(this.xold) &&
           !isUndefined(this.yold) &&
           !isUndefined(this.back);
}


