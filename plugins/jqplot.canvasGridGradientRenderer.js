(function($) {
    // Class: $.jqplot.CanvasGridGradientRenderer
    // The default jqPlot grid renderer, creating a grid on a canvas element.
    // The renderer has no additional options beyond the <Grid> class.
    $.jqplot.CanvasGridGradientRenderer = function(){
        this.shadowRenderer = new $.jqplot.ShadowRenderer();
    };
    
    // called with context of Grid object
    $.jqplot.CanvasGridGradientRenderer.prototype.init = function(options) {
        this._ctx;
        this._colours = options['colours'];
        if (! this._colours){
            this._colours = options['colors'];
        }
        if (! this._colours){
            this._colours = [[0,'#ff0000'],[0.5,'#00ff00'],[1,'#0000ff']];
        }
        this._gbound = [options['xboundmin'],options['xboundmax'],options['yboundmin'],options['yboundmax']];
        //if (this._gbound=[NaN,NaN,NaN,NaN]){
        //    this._gbound = [0,100,0,100];
        //}
        this._dir = options['dir'];
        if (! this._dir){
            this._dir = "bl-tr";
        }
        this._orig = options['orig'];
        if (! this._orig){
            this._orig = "bl";
        }
        this._radial = (options['type'] == 'radial');
        $.extend(true, this, options);
        // set the shadow renderer options
        var sopts = {lineJoin:'miter', lineCap:'round', fill:false, isarc:false, angle:this.shadowAngle, offset:this.shadowOffset, alpha:this.shadowAlpha, depth:this.shadowDepth, lineWidth:this.shadowWidth, closePath:false};
        this.renderer.shadowRenderer.init(sopts);
    };
    
    // called with context of Grid.
    $.jqplot.CanvasGridGradientRenderer.prototype.createElement = function() {
        var elem = document.createElement('canvas');
        var w = this._plotDimensions.width;
        var h = this._plotDimensions.height;
        elem.width = w;
        elem.height = h;
        this._elem = $(elem);
        this._elem.addClass('jqplot-grid-canvas');
        this._elem.css({ position: 'absolute', left: 0, top: 0 });
        if ($.browser.msie) {
            window.G_vmlCanvasManager.init_(document);
        }
        if ($.browser.msie) {
            elem = window.G_vmlCanvasManager.initElement(elem);
        }
        this._top = this._offsets.top;
        this._bottom = h - this._offsets.bottom;
        this._left = this._offsets.left;
        this._right = w - this._offsets.right;
        this._width = this._right - this._left;
        this._height = this._bottom - this._top;
        return this._elem;
    };
    
    $.jqplot.CanvasGridGradientRenderer.prototype.draw = function() {
        this._ctx = this._elem.get(0).getContext("2d");
        var ctx = this._ctx;
        var axes = this._axes;
        
        var l = axes['xaxis'].u2p(this._gbound[0])
        var r = axes['xaxis'].u2p(this._gbound[1])
        var b = axes['yaxis'].u2p(this._gbound[2])
        var t = axes['yaxis'].u2p(this._gbound[3])
        //debugger;
        if (this._radial){
            switch (this._orig){
                case "bl":
                    var gradient1 = ctx.createRadialGradient(l,b,0,l,b,b-t);
                    break;
                case "tl":
                    var gradient1 = ctx.createRadialGradient(l,t,0,l,t,b-t);
                    break;
                case "br":
                    var gradient1 = ctx.createRadialGradient(r,b,0,r,b,b-t);
                    break;
                case "tr":
                    var gradient1 = ctx.createRadialGradient(r,t,0,r,t,b-t);
                    break;
                case "c":
                    var gradient1 = ctx.createRadialGradient(r/2+l/2,b/2+t/2,0,r/2+l/2,b/2+t/2,b-t);
                    break;
            }
        } else {
            switch (this._dir){
                case "bl-tr":
                    var gradient1 = ctx.createLinearGradient(l,b,r,t);
                    break;
                case "tl-br":
                    var gradient1 = ctx.createLinearGradient(l,t,r,b);
                    break;
                case "tr-bl":
                    var gradient1 = ctx.createLinearGradient(r,t,l,b);
                    break;
                case "br-tl":
                    var gradient1 = ctx.createLinearGradient(r,b,l,t);
                    break;
                case "l-r":
                    var gradient1 = ctx.createLinearGradient(l,b,r,b);
                    break;
                case "t-b":
                    var gradient1 = ctx.createLinearGradient(l,t,l,b);
                    break;
                case "b-t":
                    var gradient1 = ctx.createLinearGradient(l,b,l,t);
                    break;
                case "r-l":
                    var gradient1 = ctx.createLinearGradient(r,b,l,b);
                    break;
            }
        }
        
        var cols = this._colours;
        for (i in cols){
            var colour = cols[i];
            gradient1.addColorStop(colour[0],colour[1]);
        }

        ctx.fillStyle=gradient1;
        this._constrainInBound = true;
        if (this._constrainInBound){
            var lbound = this._left;
            var rbound = this._right;
            var tbound = this._top;
            var bbound = this._bottom;
            if (axes['xaxis'].min < this._gbound[0]){
                lbound = axes['xaxis'].u2p(this._gbound[0]);
            }
            if (axes['xaxis'].max > this._gbound[1]){
                rbound = axes['xaxis'].u2p(this._gbound[1]);
            }
            if (axes['yaxis'].min < this._gbound[2]){
                bbound = axes['yaxis'].u2p(this._gbound[2]);
            }
            if (axes['yaxis'].max > this._gbound[3]){
                tbound = axes['yaxis'].u2p(this._gbound[3]);
            }
            var wdth = rbound-lbound;
            var hght = bbound-tbound;
            ctx.fillRect(lbound,tbound,wdth,hght);
        } else {
            ctx.fillRect(this._left,this._top,this._width,this._height);
        }
        ctx.save();
        
        if (this.drawGridlines) {
            ctx.save();
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';
            ctx.lineWidth = this.gridLineWidth;
            ctx.strokeStyle = this.gridLineColor;
            var b, e;
            var ax = ['xaxis', 'yaxis', 'x2axis', 'y2axis'];
            for (var i=4; i>0; i--) {
                var name = ax[i-1];
                var axis = axes[name];
                var ticks = axis._ticks;
                if (axis.show) {
                    for (var j=ticks.length; j>0; j--) {
                        var t = ticks[j-1];
                        if (t.show) {
                            var pos = Math.round(axis.u2p(t.value)) + 0.5;
                            switch (name) {
                                case 'xaxis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(pos, this._top, pos, this._bottom);
                                    }
                                    
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._bottom;
                                                e = this._bottom+s;
                                                break;
                                            case 'inside':
                                                b = this._bottom-s;
                                                e = this._bottom;
                                                break;
                                            case 'cross':
                                                b = this._bottom-s;
                                                e = this._bottom+s;
                                                break;
                                            default:
                                                b = this._bottom;
                                                e = this._bottom+s;
                                                break;
                                        }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[pos,b],[pos,e]], {lineCap:'butt', lineWidth:this.gridLineWidth, offset:this.gridLineWidth*0.75, depth:2, fill:false, closePath:false});
                                        }
                                        // draw the line
                                        drawLine(pos, b, pos, e);
                                    }
                                    break;
                                case 'yaxis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(this._right, pos, this._left, pos);
                                    }
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._left-s;
                                                e = this._left;
                                                break;
                                            case 'inside':
                                                b = this._left;
                                                e = this._left+s;
                                                break;
                                            case 'cross':
                                                b = this._left-s;
                                                e = this._left+s;
                                                break;
                                            default:
                                                b = this._left-s;
                                                e = this._left;
                                                break;
                                                }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[b, pos], [e, pos]], {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});
                                        }
                                        drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});
                                    }
                                    break;
                                case 'x2axis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(pos, this._bottom, pos, this._top);
                                    }
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._top-s;
                                                e = this._top;
                                                break;
                                            case 'inside':
                                                b = this._top;
                                                e = this._top+s;
                                                break;
                                            case 'cross':
                                                b = this._top-s;
                                                e = this._top+s;
                                                break;
                                            default:
                                                b = this._top-s;
                                                e = this._top;
                                                break;
                                                }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[pos,b],[pos,e]], {lineCap:'butt', lineWidth:this.gridLineWidth, offset:this.gridLineWidth*0.75, depth:2, fill:false, closePath:false});
                                        }
                                        drawLine(pos, b, pos, e);
                                    }
                                    break;
                                case 'y2axis':
                                    // draw the grid line
                                    if (t.showGridline) {
                                        drawLine(this._left, pos, this._right, pos);
                                    }
                                    // draw the mark
                                    if (t.showMark && t.mark) {
                                        s = t.markSize;
                                        m = t.mark;
                                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                                        switch (m) {
                                            case 'outside':
                                                b = this._right;
                                                e = this._right+s;
                                                break;
                                            case 'inside':
                                                b = this._right-s;
                                                e = this._right;
                                                break;
                                            case 'cross':
                                                b = this._right-s;
                                                e = this._right+s;
                                                break;
                                            default:
                                                b = this._right;
                                                e = this._right+s;
                                                break;
                                                }
                                        // draw the shadow
                                        if (this.shadow) {
                                            this.renderer.shadowRenderer.draw(ctx, [[b, pos], [e, pos]], {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});
                                        }
                                        drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
            // Now draw grid lines for additional y axes
            ax = ['y3axis', 'y4axis', 'y5axis', 'y6axis', 'y7axis', 'y8axis', 'y9axis'];
            for (var i=7; i>0; i--) {
                var axis = axes[ax[i-1]];
                var ticks = axis._ticks;
                if (axis.show) {
                    var tn = ticks[axis.numberTicks-1];
                    var t0 = ticks[0];
                    var left = axis.getLeft();
                    var points = [[left, tn.getTop() + tn.getHeight()/2], [left, t0.getTop() + t0.getHeight()/2 + 1.0]];
                    // draw the shadow
                    if (this.shadow) {
                        this.renderer.shadowRenderer.draw(ctx, points, {lineCap:'butt', fill:false, closePath:false});
                    }
                    // draw the line
                    drawLine(points[0][0], points[0][1], points[1][0], points[1][1], {lineCap:'butt', strokeStyle:axis.borderColor, lineWidth:axis.borderWidth});
                    // draw the tick marks
                    for (var j=ticks.length; j>0; j--) {
                        var t = ticks[j-1];
                        s = t.markSize;
                        m = t.mark;
                        var pos = Math.round(axis.u2p(t.value)) + 0.5;
                        if (t.showMark && t.mark) {
                            switch (m) {
                                case 'outside':
                                    b = left;
                                    e = left+s;
                                    break;
                                case 'inside':
                                    b = left-s;
                                    e = left;
                                    break;
                                case 'cross':
                                    b = left-s;
                                    e = left+s;
                                    break;
                                default:
                                    b = left;
                                    e = left+s;
                                    break;
                            }
                            points = [[b,pos], [e,pos]];
                            // draw the shadow
                            if (this.shadow) {
                                this.renderer.shadowRenderer.draw(ctx, points, {lineCap:'butt', lineWidth:this.gridLineWidth*1.5, offset:this.gridLineWidth*0.75, fill:false, closePath:false});
                            }
                            // draw the line
                            drawLine(b, pos, e, pos, {strokeStyle:axis.borderColor});
                        }
                    }
                }
            }
            
            ctx.restore();
        }
        
        function drawLine(bx, by, ex, ey, opts) {
            ctx.save();
            opts = opts || {};
            $.extend(true, ctx, opts);
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.restore();
        }
        
        if (this.shadow) {
            var points = [[this._left, this._bottom], [this._right, this._bottom], [this._right, this._top]];
            this.renderer.shadowRenderer.draw(ctx, points);
        }
        // Now draw border around grid.  Use axis border definitions. start at
        // upper left and go clockwise.
        drawLine (this._left, this._top, this._right, this._top, {lineCap:'round', strokeStyle:axes.x2axis.borderColor, lineWidth:axes.x2axis.borderWidth});
        drawLine (this._right, this._top, this._right, this._bottom, {lineCap:'round', strokeStyle:axes.y2axis.borderColor, lineWidth:axes.y2axis.borderWidth});
        drawLine (this._right, this._bottom, this._left, this._bottom, {lineCap:'round', strokeStyle:axes.xaxis.borderColor, lineWidth:axes.xaxis.borderWidth});
        drawLine (this._left, this._bottom, this._left, this._top, {lineCap:'round', strokeStyle:axes.yaxis.borderColor, lineWidth:axes.yaxis.borderWidth});
        // ctx.lineWidth = this.borderWidth;
        // ctx.strokeStyle = this.borderColor;
        // ctx.strokeRect(this._left, this._top, this._width, this._height);
        
    
        ctx.restore();
    };
})(jQuery);
