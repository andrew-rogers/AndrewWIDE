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

var SvgFigure = function(svg_el)
{
    this.svg=svg_el;
    this.ns='http://www.w3.org/2000/svg';
};

SvgFigure.prototype.drawLine = function(line, options)
{
    var params = '---';
    var stroke = '#000';

    if (typeof options == 'string') {
        params = options;
    } else if (typeof options == 'object') {
        if (options.hasOwnProperty('params')) params = options.params;
        if (options.hasOwnProperty('stroke')) stroke = options.stroke;
    }

    params=this._splitLineParams(params);

    var stroke_width=1;
    if( params.mid.match('2') ) stroke_width=2;

    var element = document.createElementNS(this.ns, 'line');
    element.setAttributeNS(null, 'x1', line.p1.x);
    element.setAttributeNS(null, 'y1', line.p1.y);
    element.setAttributeNS(null, 'x2', line.p2.x);
    element.setAttributeNS(null, 'y2', line.p2.y);
    element.setAttributeNS(null, 'stroke-width', stroke_width);
    element.setAttributeNS(null, 'stroke', stroke);
    if(params.end.slice(-1)=='>') element.setAttributeNS(null, 'marker-end', 'url(#arrow)');
    this.svg.appendChild(element);

};

SvgFigure.prototype.drawRect = function(x, y, w, h)
{
    var element = document.createElementNS(this.ns, 'rect');
    element.setAttributeNS(null, 'x', x);
    element.setAttributeNS(null, 'y', y);
    element.setAttributeNS(null, 'width', w);
    element.setAttributeNS(null, 'height', h);
    element.setAttributeNS(null, 'stroke-width', 1);
    element.setAttributeNS(null, 'stroke', '#000');
    element.setAttributeNS(null, 'fill', 'none');
    this.svg.appendChild(element);
};

SvgFigure.prototype.drawCircle = function(cp,r)
{
    var element = document.createElementNS(this.ns, 'circle');
    element.setAttributeNS(null, 'r', r);
    element.setAttributeNS(null, 'cx', cp.x);
    element.setAttributeNS(null, 'cy', cp.y);
    element.setAttributeNS(null, 'stroke-width', 1);
    element.setAttributeNS(null, 'stroke', '#000');
    element.setAttributeNS(null, 'fill', 'none');
    this.svg.appendChild(element);
};

SvgFigure.prototype.drawDot = function(cp,r)
{
    var element = document.createElementNS(this.ns, 'circle');
    element.setAttributeNS(null, 'r', r);
    element.setAttributeNS(null, 'cx', cp.x);
    element.setAttributeNS(null, 'cy', cp.y);
    this.svg.appendChild(element);
};

SvgFigure.prototype.drawPolygon = function(points)
{
    var points_str='';
    for (var i=0; i<points.length; i++)
    {
        points_str+=points[i].x+',';
        points_str+=points[i].y+',';
    }
    points_str=points_str.slice(0,-1);

    var element = document.createElementNS(this.ns, 'polygon');
    element.setAttributeNS(null, 'points', points_str);
    element.setAttributeNS(null, 'stroke-width', 1);
    element.setAttributeNS(null, 'stroke', '#000');
    element.setAttributeNS(null, 'fill', 'none');
    this.svg.appendChild(element);
};

SvgFigure.prototype.drawPolyLine = function(points, options)
{

    var params = '---';
    var stroke = '#000';

    if (typeof options == 'string') {
        params = options;
    } else if (typeof options == 'object') {
        if (options.hasOwnProperty('params')) params = options.params;
        if (options.hasOwnProperty('stroke')) stroke = options.stroke;
    }

    var points_str='';
    for (var i=0; i<points.length; i++)
    {
        points_str+=points[i].x+',';
        points_str+=points[i].y+',';
    }
    points_str=points_str.slice(0,-1);

    params=this._splitLineParams(params);

    var element = document.createElementNS(this.ns, 'polyline');
    element.setAttributeNS(null, 'points', points_str);
    element.setAttributeNS(null, 'stroke-width', 1);
    element.setAttributeNS(null, 'stroke', stroke);
    element.setAttributeNS(null, 'fill', 'none');
    if(params.end.slice(-1)=='>') element.setAttributeNS(null, 'marker-end', 'url(#arrow)');
    this.svg.appendChild(element);
};

SvgFigure.prototype.drawText = function()
{
    if (arguments.length == 5) {
        this._drawText(arguments[0],arguments[1],arguments[4],{fs: arguments[3], anchor: arguments[2]});
    } else {
        this._drawText(arguments[0],arguments[1],arguments[2],arguments[3]);
    }
};

SvgFigure.prototype._drawText = function(x,y,text,options)
{
    var anchor = null;
    if (options.hasOwnProperty('anchor')) anchor = options.anchor;

    var fs = null;
    if (options.hasOwnProperty('fs')) fs = options.fs;

    var rotation = null;
    if (options.hasOwnProperty('rotation')) rotation = options.rotation;

    var element = document.createElementNS(this.ns, 'text');
    element.setAttributeNS(null, 'x', x);
    element.setAttributeNS(null, 'y', y);
    if (fs) element.setAttributeNS(null, 'font-size', fs);
    element.setAttributeNS(null, 'text-anchor', 'start');
    element.textContent=text;

    this.svg.appendChild(element);

    if (anchor) {
        var bb=element.getBBox();

        if(anchor[0]=='t')element.setAttributeNS(null, 'y', 2*y-bb.y);
        else if(anchor[0]=='b')element.setAttributeNS(null, 'y', 2*y-(bb.y+bb.height));
        else element.setAttributeNS(null, 'y', 2*y-(bb.y+bb.height/2));

        if(anchor[1]=='l')element.setAttributeNS(null, 'x', x);
        else if(anchor[1]=='r')element.setAttributeNS(null, 'x', x-bb.width);
        else element.setAttributeNS(null, 'x', x-bb.width/2);
    }

    if (rotation) element.setAttributeNS(null, 'transform', 'rotate('+rotation+' '+x+','+y+')');
};

SvgFigure.prototype.draw = function(shape)
{
    shape.draw(this);
};

SvgFigure.prototype._splitLineParams = function(params)
{
    // Slice parameters string, both end params strings are same length and not larger than middle params string.
    if(!params) params='---';
    var len_e = Math.floor(params.length/3.0);
    var len_m = params.length-2*len_e;
    var param_obj={};
    param_obj.begin = params.slice(0,len_e);
    param_obj.mid = params.slice(len_e,len_e+len_m);
    param_obj.end = params.slice(len_e+len_m,len_e+len_m+len_e);
    return param_obj;
};

