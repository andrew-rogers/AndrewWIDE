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
    var lines = awdoc.split('\n');
    var src = "";
    var obj={};
    var cnt = 0;
    for (var i = 0; i<lines.length; i++) {
        var line = lines[i];

        // Check if line is AW tag
        if (line.startsWith("AW{") && line.endsWith("}")) {

            // Render the previous section
            this._render( obj, src, cnt );

            // Get attributes of this new section
            obj = JSON.parse(line.slice(2));

            src = "";
            cnt++;
        } else {
            src=src+line+"\n";
        }
    }

    // Render remaining content
    this._render( obj, src, cnt );
};

AwDocRenderer.prototype._render = function( obj, src, cnt ) {

    // Create a default ID if one is not given
    if (obj.hasOwnProperty("id") == false) obj.id = obj.type+"_"+cnt;

    // Create a div for the rendered output.
    var div = document.createElement("div");
    div.id = obj.id;
    this.div.appendChild(div);

    // Invoke the relevant renderer.
    var renderer_name = obj.type;
    if (this.renderers.hasOwnProperty(renderer_name)) {
        this.renderers[renderer_name].render( src, div, function() {
            console.log(renderer_name+" "+obj.id+" done!");
        });
    }
};

