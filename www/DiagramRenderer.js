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


var DiagramRenderer = function() {

    

};

DiagramRenderer.prototype.render = function(diag_script, div, callback) {

    var fig = this._createSvgFigureInDiv( div );
    eval(diag_script);
    if( callback ) callback();
};

DiagramRenderer.prototype._createSvgFigureInDiv = function(div) {
    div.style.width = "600px";
    var svg_str ='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">\n';
    svg_str    +='    <defs>\n';
    svg_str    +='        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">\n';
    svg_str    +='            <path d="M9,3 L0,6 L0,0 z" fill="#000" />\n';
    svg_str    +='        </marker>\n';
    svg_str    +='    </defs>\n';
    svg_str    +='</svg>';
    div.innerHTML=svg_str;
    var that = this;
    div.onclick=function(e) {
        that._clicked(div);
    };
    var svg_diagram = div.childNodes[0];
    var fig=new SvgFigure(svg_diagram);
    return fig;
};

DiagramRenderer.prototype._clicked = function(div) {
    if (div.childNodes.length < 2) {
        var svg_str=XML.stringify(div.childNodes[0]);
        var blob=new Blob([svg_str]);
        var url = URL.createObjectURL(blob);
        var fn = "diagram.svg";
        var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';

        var div_download = document.createElement("div");
        var ta=document.createElement("textarea");
        ta.value = JSON.stringify(div.src_json);
        ta.style.width = "100%";
        div.appendChild(ta);
        ta.style.height = (ta.scrollHeight+8)+"px";
        div_download.innerHTML += a_download
        div.appendChild(div_download);
    }
};

