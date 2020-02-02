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

SvgFigure.prototype.drawLine = function(line, params)
{
    // Slice parameters string, both end params strings are same length and not larger than middle params string.
    var len_e = Math.floor(params.length/3.0);
    var len_m = params.length-2*len_e;
    var params_begin = params.slice(0,len_e);
    var params_mid = params.slice(len_e,len_e+len_m);
    var params_end = params.slice(len_e+len_m,len_e+len_m+len_e);

    var stroke_width=1;
    if( params_mid.match('2') ) stroke_width=2;

    var element = document.createElementNS(this.ns, 'line');
    element.setAttributeNS(null, 'x1', line.p1.x);
    element.setAttributeNS(null, 'y1', line.p1.y);
    element.setAttributeNS(null, 'x2', line.p2.x);
    element.setAttributeNS(null, 'y2', line.p2.y);
    element.setAttributeNS(null, 'stroke-width', stroke_width);
    element.setAttributeNS(null, 'stroke', '#000');
    if(params_end.slice(-1)=='>') element.setAttributeNS(null, 'marker-end', 'url(#arrow)');
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

SvgFigure.prototype.draw = function(shape)
{
    shape.draw(fig);
};

