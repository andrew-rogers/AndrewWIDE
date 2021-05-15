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

var fig = null;
var grid= null;

function SvgEditor(div) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        div.setAttribute("class","editor");
        document.body.appendChild(div);
    }

    grid = new Grid();

    this._createEditor(div);
}

SvgEditor.prototype._createEditor = function(div) {
    // Create a text area for JavaScript
    this.ta_src = document.createElement("textarea");
    this.ta_src.value = "grid.set([20,40],[35,60]);\npoints=grid.getPoints([0,0, 1,0, 1,1]);\nfig.drawPolyLine(points);";
    this.ta_src.style.width = "100%";
    this.ta_src.rows=10;
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
    this.ta_points.rows=5;
    div.appendChild(this.ta_points);
};

SvgEditor.prototype._render = function() {
    this.fig = this._createSvgFigureInDiv(this.div_svg);
    fig = this.fig;
    var src = this.ta_src.value;
    eval(src);

    // Clear the points array
    this.points=[];
    this.indices=[];
    this.str_points="";
    this.str_indices="";

    // Draw the guide lines
    grid.draw(this.fig);
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
    this.str_points += p.x+','+p.y+', ';
    this.str_indices += grid.getClosestX(p.x)+',';
    this.str_indices += grid.getClosestY(p.y)+', ';
    this.ta_points.value = this.str_points + '\n'
                         + this.str_indices;
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

function Grid() {
}

Grid.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
};

Grid.prototype.getPoints = function(indices) {
    var points=[]
    for (var i=0; i<indices.length; i=i+2) {
        points.push({x: this.x[indices[i]], y: this.y[indices[i+1]]});
    }
    return points;
};

Grid.prototype.draw = function(fig) {
    for (var i=0; i<this.x.length; i++) {
        fig.drawVGuide(this.x[i]);
    }
    for (var i=0; i<this.y.length; i++) {
        fig.drawHGuide(this.y[i]);
    }
};

Grid.prototype.getClosestX = function(x) {
    return this._calcClosestIndex( this.x, x );
};

Grid.prototype.getClosestY = function(y) {
    return this._calcClosestIndex( this.y, y );
};

Grid.prototype._calcClosestIndex = function(arr, val) {
    var min = 100000;
    var index = 0;
    for (var i=0; i<arr.length; i++) {
        dist = arr[i] - val;
        if (dist < 0) dist=-dist;
        if (dist < min) {
            min = dist
            index = i;
        }
    }
    return index;
};

