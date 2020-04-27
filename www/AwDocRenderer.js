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

function AwDocRenderer(div) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        document.body.appendChild(div);
    }

    this.div = div;
    this.renderers = {};
}

AwDocRenderer.prototype.registerRenderer = function( name, renderer ) {
    this.renderers[name]=renderer;
};

AwDocRenderer.prototype.render = function( awdoc ) {
    this.div.innerHTML = awdoc;

    var divs = this.div.getElementsByTagName("div");
    for (var i = 0; i < divs.length; i++){
        var div = divs[i];
        var renderer_name = div.className;
        if (this.renderers.hasOwnProperty(renderer_name)) {
            this._render( div, i, this.renderers[renderer_name]);
        }
    }
};

AwDocRenderer.prototype._render = function( div, i, renderer ) {
    var src=div.childNodes[0].data;
    div.innerHTML = "";
    if (div.id=="") div.id = div.className+"_"+i;
    renderer.render(src, div, function() {
        console.log(div.className+" "+i+" done!");
    });
};

