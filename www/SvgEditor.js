/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2021  Andrew Rogers
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

// Dependencies:
//   Diagram/SvgFigure.js
//   XML.js

var svg = null;
var grid={};

function genPoints(x,y,xi,yi) {
    var points=[]
    for (var i=0; i<xi.length; i=i+1) {
        points.push({x: x[xi[i]], y: y[yi[i]]});
    }
    return points;
}

function SvgEditor(div) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        div.setAttribute("class","editor");
        document.body.appendChild(div);
    }

    this._createEditor(div);
}

SvgEditor.prototype._createEditor = function(div) {
    // Create a text area for JavaScript
    this.ta_src = document.createElement("textarea");
    this.ta_src.value = "grid.x=[20,40];\ngrid.y=[35,60];\npoints=genPoints(grid.x,grid.y,[0,1,1],[0,0,1]);\nsvg.drawPolyLine(points);";
    this.ta_src.style.width = "100%";
    div.appendChild(this.ta_src);

    // Create an execute button
    var btn=document.createElement("button");
    btn.innerHTML = "Run";
    var that = this;
    btn.onclick = function() {
        that._render();
    };
    div.appendChild(btn);

    // Create SVG div
    this.div_svg = document.createElement("div");
    div.appendChild(this.div_svg);

    // Create points text area
    this.ta_points = document.createElement("textarea");
    this.ta_points.style.width = "100%";
    div.appendChild(this.ta_points);
};

SvgEditor.prototype._render = function() {
    this.svg = this._createSvgFigureInDiv(this.div_svg);
    svg = this.svg;
    var src = this.ta_src.value;
    eval(src);

    // Clear the points array
    this.points=[];
    this.ta_points.value="";

    // Draw the guide lines
    for (var i=0; i<grid.x.length; i=i+1) {
        this.svg.drawVGuide(grid.x[i]);
    }
    for (var i=0; i<grid.y.length; i=i+1) {
        this.svg.drawHGuide(grid.y[i]);
    }
};

SvgEditor.prototype._createSvgFigureInDiv = function(div) {
    div.style.width = "600px";
    div.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="600px" height="400px" viewBox="0 0 600 400"></svg>';
    var that = this;
    div.onclick=function(e) {
        that._clicked(div);
    };
    var svg_plot = div.childNodes[0];
    svg_plot.onclick = function(e) {
        var p = svg_plot.createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        var p =  p.matrixTransform(svg_plot.getScreenCTM().inverse());
        that._clickedPoint(p);
    };
    var fig=new SvgFigure(svg_plot);
    return fig;
};

SvgEditor.prototype._clickedPoint = function(p) {
    this.points.push(p);
    this.ta_points.value+=p.x+','+p.y+', ';
};

SvgEditor.prototype._clicked = function(div) {
    if (div.childNodes.length < 2) {
        var svg_str=XML.stringify(div.childNodes[0]);
        var blob=new Blob([svg_str]);
        var url = URL.createObjectURL(blob);
        var fn = "plot.svg";
        var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';

        var div_download = document.createElement("div");
        div_download.innerHTML += a_download
        div.appendChild(div_download);
    }
};

