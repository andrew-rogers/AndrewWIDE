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

// Dependencies:
//   Diagram/Plot/Plot.js
//   Diagram/SvgFigure.js

var PlotRenderer = function() {
    
};

PlotRenderer.prototype.render = function(json, div, callback) {
    var fig = this._createSvgFigureInDiv( div );
    var p = new Plot();
    p.addSeries(json.data);
    var xlabel = ""
    if (json["xlabel"]) xlabel = json.xlabel;
    var ylabel = ""
    if (json["ylabel"]) ylabel = json.ylabel;
    p.axisLabels(xlabel, ylabel);
    p.draw(fig);
    if( callback ) callback();
};

PlotRenderer.prototype._createSvgFigureInDiv = function(div) {
    div.style.width = "600px";
    div.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"></svg>';
    var svg_plot = div.childNodes[0];
    var fig=new SvgFigure(svg_plot);
    return fig;
};

var JsonRenderer = function() {
    this.cmds = {plot: new PlotRenderer()};
};

JsonRenderer.prototype.render = function(json, div, callback) {
    var cmd=json[0]; // TODO process all the commands
    if (cmd["cmd"] ) this.cmds[cmd.cmd].render( cmd, div, callback );
};

