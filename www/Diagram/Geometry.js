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

var Transform = function(a,b,c,d,dx,dy)
{
    this.a=a;
    this.b=b;
    this.c=c;
    this.d=d;
    this.dx=dx;
    this.dy=dy;
};

Transform.prototype.transform = function(points)
{
    for( var i=0; i<points.length; i++)
    {
        var p=points[i];
        p.x = this.a *p.x + this.c * p.y + this.dx;
        p.y = this.b *p.x + this.d * p.y + this.dy;
        points[i]=p;
    }
};

var Point = function(x, y)
{
    this.x=x;
    this.y=y;
};

var Line = function(p1, p2)
{
    // Copy points
    this.p1={...p1};
    this.p2={...p2};
};

Line.prototype.extend = function(ex)
{
    var dx=this.p2.x-this.p1.x;
    var dy=this.p2.y-this.p1.y;
    var l=Math.sqrt(dx*dx+dy*dy);
    var scale=(l+ex)/l;
    dx=dx*scale;
    dy=dy*scale;
    this.p2.x=this.p1.x+dx;
    this.p2.y=this.p1.y+dy;
};

