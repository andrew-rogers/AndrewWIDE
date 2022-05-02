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

function AwDocRenderer(docname, div) {
    this.docname = docname;
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        document.body.appendChild(div);
    }

    this.div = div;
    this.renderers = {};
    this.queue = [];
    this.cnt = 0;
    this.running = false;
    this.renderers["array"] = this;
    this.renderers["json"] = this;
    this.named_sections = {};
}

AwDocRenderer.prototype.start = function () {
    this.running = true;
    this._dispatch();
}

AwDocRenderer.prototype.post = function ( obj, div, callback ) {

    if (obj.hasOwnProperty("id")) {
        // If section has an ID store it for alter referencing.
        this.named_sections[obj.id] = obj;
    }
    else {
        // Create a default ID if one is not given
        obj.id = obj.type + "_" + this.cnt;
    }
    this.cnt++;

    this.queue.push( {"obj":obj, "div":div, "callback":callback} );
    if( this.running ) this._dispatch();
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
            if (cnt>0) this._render( obj, src );

            // Get attributes of this new section
            obj = JSON.parse(line.slice(2));

            src = "";
            cnt++;
        } else {
            src=src+line+"\n";
        }
    }

    // Render remaining content
    if (cnt>0) this._render( obj, src );
    else this._render( {"type":"json"}, src, 0 ); // The doc may have just JSON.
};

AwDocRenderer.prototype.renderObj = function( obj, div, callback ) {
    var type = obj.type;
    if (type == "array") {
        div.innerHTML="";
        for (var i=0; i<obj.array.length; i++) {
            var new_div = document.createElement("div");
            div.appendChild(new_div);
            this.post( obj.array[i], new_div, callback );
        }
    }
    else if (type == "json") {
        var new_obj = JSON.parse(obj.content);
        this.post( { "type":"array", "array":new_obj }, div, callback);
    }
};

AwDocRenderer.prototype._dispatch = function() {
    while( this.queue.length > 0 ) {
        obj = this.queue.shift();

        // Invoke the relevant renderer.
        var renderer_name = obj.obj.type;
        if (this.renderers.hasOwnProperty(renderer_name)) {
            this.renderers[renderer_name].renderObj( obj.obj, obj.div, obj.callback );
        }
        else {
            var ta = document.createElement("textarea");
            ta.value = "Error: No renderer for '" + renderer_name + "'\n";
            ta.value += JSON.stringify(obj.obj);
            ta.style.width = "100%";
            obj.div.appendChild(ta);
        }
    }
};

AwDocRenderer.prototype._render = function( obj, src ) {

    // Create a div for the rendered output.
    var div = document.createElement("div");
    this.div.appendChild(div);

    obj.content = src;
    callback = function() {
        console.log(obj.type+" "+obj.id+" done!");
    };

    this.post( obj, div, callback );
};

