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
//   XML.js

asyncLoader.load( [
    "https://cdn.plot.ly/plotly-2.12.1.min.js" ]);

var PlotRenderer = function(awdr) {
    awdr.registerRenderer("plot", this);
    awdr.registerRenderer("plotly", this);
};

PlotRenderer.prototype.renderObj = function(obj, div, callback) {
    var type = obj.type;
    if (type == "plot_old") {
        div.src_obj = obj;
        var fig = this._createSvgFigureInDiv( div );
        var p = new Plot();

        // Get the series
        if (obj["data"]) {
            p.addSeries(obj.data);
        } else if (obj["x"]) {
            p.addSeries(obj.x, obj.y);
        }

        // Get the labels
        var xlabel = ""
        if (obj["xlabel"]) xlabel = obj.xlabel;
        var ylabel = ""
        if (obj["ylabel"]) ylabel = obj.ylabel;
        p.axisLabels(xlabel, ylabel);

        p.draw(fig);
    }
    if (type == "plot") {
        var layout = obj["layout"] || {};
        if (obj["xlabel"]) layout["xaxis"] = {"title": obj.xlabel};
        if (obj["ylabel"]) layout["yaxis"] = {"title": obj.ylabel};
        Plotly.newPlot(div, obj.data, layout);
    }
    if( callback ) callback();
};

PlotRenderer.prototype._createSvgFigureInDiv = function(div) {
    div.style.width = "600px";
    div.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"></svg>';
    var that = this;
    div.onclick=function(e) {
        that._clicked(div);
    };
    var svg_plot = div.childNodes[0];
    var fig=new SvgFigure(svg_plot);
    return fig;
};

PlotRenderer.prototype._clicked = function(div) {
    if (div.childNodes.length < 2) {
        var svg_str=XML.stringify(div.childNodes[0]);
        var blob=new Blob([svg_str]);
        var url = URL.createObjectURL(blob);
        var fn = "plot.svg";
        var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';

        var div_download = document.createElement("div");
        var ta=document.createElement("textarea");
        ta.value = JSON.stringify(div.src_obj);
        ta.style.width = "100%";
        div.appendChild(ta);
        ta.style.height = (ta.scrollHeight+8)+"px";
        div_download.innerHTML += a_download
        div.appendChild(div_download);
    }
};

