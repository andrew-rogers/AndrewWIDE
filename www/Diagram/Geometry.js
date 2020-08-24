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

Transform.prototype.rotate = function(p1,p2)
{
    var angle = p1;
    if( typeof p2 !== 'undefined') angle=Math.atan2(p2.y-p1.y,p2.x-p1.x);
    var C = Math.cos(angle);
    var S = Math.sin(angle);
    var a = this.a*C+this.c*S;
    var b = this.b*C+this.d*S;
    this.c = -this.a*S+this.c*C;
    this.d = -this.b*S+this.d*C;
    this.a=a;
    this.b=b;
};

Transform.prototype.transform = function(points)
{
    for( var i=0; i<points.length; i++)
    {
        var p=points[i];
        var x = this.a *p.x + this.c * p.y + this.dx;
        p.y = this.b *p.x + this.d * p.y + this.dy;
        p.x = x;
        points[i]=p;
    }
};

var Triangle = function(pA,pB,pC)
{
    this.pA = pA;
    this.pB = pB;
    this.pC = pC;
}

// Given point A, length c, length a and point C 
Triangle.prototype.fromPLLP = function (pA,lc,la,pC)
{
    this.pA = pA;
    this.pC = pC;

    // lb is distance between pA and pC
    var lb=pA.distance(pC);

    // Cosine rule to find angle A
    var A=-Math.acos((lb*lb+lc*lc-la*la)/(2*lb*lc));

    // Get point B
    this.pB = pA.addPolar(lc,A+pA.angle(pC));
}

var Point = function(x, y)
{
    this.x=x;
    this.y=y;
};

Point.prototype.addPolar = function(radius, angle)
{
    var x=this.x+radius*Math.cos(angle);
    var y=this.y+radius*Math.sin(angle);
    return new Point(x,y);
}

Point.prototype.angle = function (p)
{
    var dx=p.x-this.x;
    var dy=p.y-this.y;
    return Math.atan2(dy,dx);
}

Point.prototype.distance = function (p)
{
    var dx=p.x-this.x;
    var dy=p.y-this.y;
    return Math.sqrt(dx*dx+dy*dy);
}

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

