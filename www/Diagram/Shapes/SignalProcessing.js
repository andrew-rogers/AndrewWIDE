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

var Adder = function(cp, radius)
{
    this.cp={...cp};
    this.radius=radius;
};

Adder.prototype.draw = function(fig)
{
    fig.drawCircle(this.cp, this.radius);
    var r=this.radius/2;

    // Draw the +
    var p1=new Point(this.cp.x-r,this.cp.y);
    var p2=new Point(this.cp.x+r,this.cp.y);
    var p3=new Point(this.cp.x,this.cp.y-r);
    var p4=new Point(this.cp.x,this.cp.y+r);
    fig.drawLine(new Line(p1,p2),'-2-');
    fig.drawLine(new Line(p3,p4),'-2-');
};

Adder.prototype.getConnection = function(point)
{
    var l=new Line(point, this.cp);
    l.extend(-this.radius);
    return new Point(l.p2.x,l.p2.y);
};

var Delay = function(cp, w, h, text)
{
    this.cp=cp;
    this.x=cp.x-w/2;
    this.y=cp.y-h/2;
    this.w=w;
    this.h=h;
    this.text=text;
};

Delay.prototype.draw = function(fig)
{
    fig.drawRect(this.x, this.y, this.w, this.h);
    var font_size=12;
    fig.drawText(this.x+this.w/2, this.y+this.h/2+font_size/3, 'middle', font_size, this.text);
};

var Amplifier = function(g, text)
{
    this.points=this._calcPoints(g);
    this.text=text;
};

Amplifier.prototype._calcPoints = function(g)
{
    var p1=new Point(-0.5,-0.6);
    var p2=new Point(0.5,0); // Output connection
    var p3=new Point(-0.5,0.6);
    var p4=new Point(-0.5,0); // Input connection
    var points=[p1,p2,p3,p4];
    g.transform(points);
    return points;
};

Amplifier.prototype.getConnections = function()
{
    return {in: this.points[3], out: this.points[1]};
};

Amplifier.prototype.draw = function(fig)
{
    fig.drawPolygon([this.points[0],this.points[1],this.points[2]]);
    /// @todo Draw the text
};

var AmplifierConnector = function(s1,s2,text)
{
    /// @todo Draw the lines to connection points of amplifier.
    this.s2=s2;
    var cp=new Point((s1.cp.x+s2.cp.x)/2,(s1.cp.y+s2.cp.y)/2);
    var g=new Transform(7,0,0,7,cp.x,cp.y);
    this.amp = new Amplifier(g,text);
};

AmplifierConnector.prototype.draw = function(fig)
{
    this.amp.draw(fig);
    var connections = this.amp.getConnections();
    var l = new Line(connections.out,this.s2.getConnection(connections.out));
    fig.drawLine(l,'-->');
};
