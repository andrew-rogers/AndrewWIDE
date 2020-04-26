/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2020  Andrew Rogers
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

var Plot = function()
{
    this.series=[];
    this.legends=[];
    this.gx=50;
    this.gy=10;
    this.gw=540;
    this.gh=340;
    this.colours=["red", "green", "blue"];
};

Plot.prototype.addSeries = function()
{
    var series={}
    var points=[];

    if (arguments.length == 1) {
        var arr = arguments[0];
        for (var x=0; x<arr.length; x++) points[x]={x: x, y: arr[x]};
    }

    if (arguments.length == 2) {
        var arr_x = arguments[0];
        var arr_y = arguments[1];
        for (var n=0; n<arr_x.length; n++) points[n]={x: arr_x[n], y: arr_y[n]};
    }

    series.points=points;
    this.series.push(series);
};

Plot.prototype.axisLabels = function(xlabel, ylabel)
{
    this.xlabel=xlabel;
    this.ylabel=ylabel;
};

Plot.prototype.setLegends = function(legends)
{
    this.legends = legends;
}

Plot.prototype.draw = function(fig)
{
    var range = this._getRange();

    var xsteps = this._calcAxisSteps(range.xmin, range.xmax, 6);
    var xmin = xsteps[0];
    var xmax = xsteps[xsteps.length-1];
    var ysteps = this._calcAxisSteps(range.ymin, range.ymax, 4);
    var ymin = ysteps[0];
    var ymax = ysteps[ysteps.length-1];

    // Calculate scaling and offset
    var xscale = this.gw/(xmax-xmin);
    var xoffset = this.gx-xscale*xmin;
    var yscale = this.gh/(ymin-ymax);
    var yoffset = this.gy+this.gh-yscale*ymin;

    // Draw axis
    var x1 = xmin * xscale + xoffset;
    var x2 = xmax * xscale + xoffset;
    var y1 = ymin * yscale + yoffset;
    var y2 = ymax * yscale + yoffset;
    fig.drawRect(x1, y2, x2 - x1, y1 - y2);
    var y1 = this.gy;
    var y2 = this.gy+this.gh;
    for (var i=1; i<xsteps.length-1; i++) {
        var x = xsteps[i] * xscale + xoffset;
        fig.drawLine({p1:{x: x, y: y1},p2:{x: x, y: y1+3}});
        fig.drawLine({p1:{x: x, y: y2},p2:{x: x, y: y2-3}});
    }
    var xstrings = this._numbersToStrings(xsteps,3);
    for (var i=0; i<xsteps.length; i++) {
        var step = xsteps[i];
        fig.drawText(step * xscale + xoffset, y2+5, 'tc' , 10, xstrings[i]);
    }
    var x1 = this.gx;
    var x2 = this.gx+this.gw;
    for (var i=1; i<ysteps.length-1; i++) {
        var y = ysteps[i] * yscale + yoffset;
        fig.drawLine({p1:{x: x1, y: y},p2:{x: x1+3, y: y}});
        fig.drawLine({p1:{x: x2, y: y},p2:{x: x2-3, y: y}});
    }
    var ystrings = this._numbersToStrings(ysteps,3);
    for (var i=0; i<ysteps.length; i++) {
        var step = ysteps[i];
        fig.drawText(x1-5, step * yscale + yoffset, 'cr' , 10, ystrings[i]);
    }
    if(this.xlabel) fig.drawText(this.gx+this.gw/2, this.gy+this.gh+20, 'tc', 10, this.xlabel);
    if(this.ylabel) fig.drawText(this.gx-30, this.gy+this.gh/2, this.ylabel, {rotation: -90, fs: 10, anchor: 'bc'});

    // Draw series
    var y = this.gy + 10;
    for (var i=0; i<this.series.length; i++) {
        var points = this.series[i].points;
        points = this._scalePoints(points, xscale, xoffset, yscale, yoffset);
        var line_opts = {stroke: this.colours[i%this.colours.length]};
        fig.drawPolyLine(points, line_opts);

        if (this.legends[i]) {
            var x = this.gx + this.gw;
            fig.drawLine({p1: {x: x-50, y: y}, p2: {x: x-40, y: y}}, line_opts);
            fig.drawText(x-38, y, this.legends[i], {anchor: 'cl', fs: 10});
            y+=15;
        }
    }
};

Plot.prototype._getRange = function()
{
    var xmin = Number.POSITIVE_INFINITY;
    var xmax = Number.NEGATIVE_INFINITY;
    var ymin = Number.POSITIVE_INFINITY;
    var ymax = Number.NEGATIVE_INFINITY;
    for (var i=0; i<this.series.length; i++) {
        var points = this.series[i].points;
        for (var p=0; p<points.length; p++) {
            if(points[p].x < xmin) xmin=points[p].x;
            if(points[p].x > xmax) xmax=points[p].x;
            if(points[p].y < ymin) ymin=points[p].y;
            if(points[p].y > ymax) ymax=points[p].y;
        }
    }
    return {xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax};
};

Plot.prototype._scalePoints = function(points, xscale, xoffset, yscale, yoffset)
{
    var ret=[];
    for (var p=0; p<points.length; p++) {
        var x=xscale * points[p].x + xoffset;
        var y=yscale * points[p].y + yoffset;
        ret.push({x: x, y: y});
    }
    return ret;
};

Plot.prototype._calcAxisSteps = function(min, max, min_divs)
{
    // Axis steps 1,2,5,10,20,50,100,....
    var sa = [10,5,2,1];
    var max_step = (max - min) / min_divs;
    var decade = Math.floor(Math.log10(max_step));

    var si=0;
    var step_size = sa[si]*Math.pow(10,decade);
    var num_divs = (max-min)/step_size;
    
    while (num_divs < min_divs) {
        si++;
        step_size = sa[si]*Math.pow(10,decade);
        num_divs = (max-min)/step_size;
    }

    var steps=[]
    for (var step = Math.floor(min/step_size)*step_size; step < (max+step_size); step+=step_size) steps.push(step);   
    return steps;
};

Plot.prototype._numbersToStrings = function(nums, precision)
{
    var largest = nums[0];
    for (var i=0; i<nums.length; i++) {
        if (nums[i] > largest) largest = nums[i];
        if (-nums[i] > largest) largest = -nums[i];
    }

    var ret=[];
    var smallest = largest/Math.pow(10,precision);
    for (var i=0; i<nums.length; i++) {
        var num = nums[i];
        if (Math.abs(num) < smallest) ret.push("0");
        else {
            var str=num.toPrecision(precision);
            if (str.includes('.')) {
                // Trim trailing zeros and decimal point
                while (str.slice(-1) == '0') str=str.slice(0,-1);
                if (str.slice(-1) == '.') str=str.slice(0,-1);
            }
            ret.push(str);
        }
    }

    return ret;
}

