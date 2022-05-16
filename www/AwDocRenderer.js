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

    this.aw_json = []; // Used to store all document objects for download.
    this.div = div;
    this.renderers = {};
    this.queue = [];
    this.cnt = 0;
    this.running = false;
    this.renderers["array"] = this;
    this.renderers["json"] = this;
    this.async = [];
    this.named_sections = {};
    this.runnables = {};
    this.cache = [];
    this.cache_map = {};

    // Make download link for serverless doc but hide for now
    this.download_link = document.createElement("a");
    this.download_link.hidden = true;
    div.appendChild(this.download_link);
}

AwDocRenderer.prototype.addCache = function ( src_obj, resp ) {
    var hash = this._createHash(JSON.stringify(src_obj.src));
    this.cache_map[hash] = this.cache.length;
    this.cache.push({"src_type": src_obj.type, "hash": hash, "resp": resp});
};

AwDocRenderer.prototype.addRunnable = function ( runnable ) {
    this.runnables[runnable.id] = runnable;
    for (var i=0; i<runnable.inputs.length; i++) {
        var input_id = runnable.inputs[i];
        this._createNamedSection( input_id );
        this.named_sections[input_id].deps.push(runnable.id);
    }
};

AwDocRenderer.prototype.post = function ( obj, div, callback ) {

    if (obj.hasOwnProperty("id")) {
        // If section has an ID store it for alter referencing.
        this._createNamedSection( obj.id );
        this.named_sections[obj.id].obj = obj;
    }
    else {
        // Create a default ID if one is not given
        obj.id = obj.type + "_" + this.cnt;
    }
    this.cnt++;

    this.queue.push( {"obj":obj, "div":div, "callback":callback, "pass": this.pass+1} );
    if( this.running ) this._dispatch();
};

AwDocRenderer.prototype.registerAsync = function( renderer ) {
    var id = this.async.length;
    this.async.push( {"done": false} );
    return id;
};

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
        if (line.startsWith("AW{") && line.trim().endsWith("}")) {

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
        var running = this.running;
        this.running = false; // Disable dispatch until all array items posted.
        for (var i=0; i<obj.array.length; i++) {
            var new_div = document.createElement("div");
            div.appendChild(new_div);
            this.post( obj.array[i], new_div, callback );
        }
        this.running = running;
        this._dispatch();
    }
    else if (type == "json") {
        var new_obj = JSON.parse(obj.content);
        this.post( { "type":"array", "array":new_obj }, div, callback);
    }
};

AwDocRenderer.prototype.renderingComplete = function ( id ) {
    this.async[id]["done"] = true;

    // Check if all async renderers done
    var done = true;
    for (var i=0; i<this.async.length; i++) {
        if (this.async[i].done == false) done = false;
    }
    if (done) this._prepareServerlessDoc();
}

AwDocRenderer.prototype.runDeps = function ( id ) {
    var deps = this.named_sections[id].deps;
    for (var i=0; i<deps.length; i++) {
        var runnable_id = deps[i];
        this.runnables[runnable_id].run( callback );
    }
}

AwDocRenderer.prototype.setCache = function ( cache ) {
    this.cache = cache;
    for (var i=0; i<cache.length; i++) {
        var hash = cache[i].hash;
        this.cache_map[hash] = i;
    }
}

AwDocRenderer.prototype.start = function () {
    this.running = true;
    this._dispatch();
}

AwDocRenderer.prototype._createHash = function( str ) {
    var hash = 0;
    var prime = 127;
    for (var i=0; i<str.length; i++) {
        hash = hash * prime + ( str.charCodeAt(i) & 0xff );
        hash |= 0; // 32-bit. JavaScript uses double float for numbers.
    }
    return hash.toString();
};

AwDocRenderer.prototype._createNamedSection = function( name ) {

    // Create the named section if it doesn't exist
    if (this.named_sections.hasOwnProperty(name) == false) this.named_sections[name] = {"obj": {}, "deps": []};
};

AwDocRenderer.prototype._dispatch = function() {
    while( this.queue.length > 0 ) {
        obj = this.queue.shift();

        // Attempt to render obj from cache.
        if (this._renderUsingCache(obj)==false) {

            // Can't render from cache. Invoke the relevant renderer.
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
    }
};

AwDocRenderer.prototype._prepareServerlessDoc = function( obj, src ) {
    var html = "<!DOCTYPE html>\n<html>\n\t<head>\n";
    html += "\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" charset=\"UTF-8\">\n";
    html += "\t\t<script src=\"AwAll.js\"></script>\n";
    html += "\t\t<script src=\"https://cdn.jsdelivr.net/npm/marked/marked.min.js\"></script>\n";
    html += "\t\t<script src=\"https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS-MML_SVG\"></script>\n";
    html += "\t</head>\n\t<body>\n"
    html += "\t\t<textarea id=\"ta_awjson\" hidden>\n" + JSON.stringify(this.aw_json) + "\n\t\t</textarea>\n";
    html += "\t\t<textarea id=\"ta_cache\" hidden>\n" + JSON.stringify(this.cache) + "\n\t\t</textarea>\n";
    html += "\t\t<script>\n";
    html += "var awdr = new AwDocRenderer( \"" + this.docname + "\" );\n";
    html += "new AwCppRenderer(awdr);\n";
    html += "var cppwasm = new AwCppWasmRenderer(awdr);\n";
    html += "var ta_awjson = document.getElementById(\"ta_awjson\");\n";
    html += "awdr.registerRenderer(\"awcppwasm\", cppwasm);\n";
    html += "awdr.registerRenderer(\"mjmd\", new MathJaxMarkdownRenderer());\n";
    html += "awdr.registerRenderer(\"diagram\", new DiagramRenderer());\n";
    html += "awdr.registerRenderer(\"plot\", new PlotRenderer());\n";
    html += "awdr.setCache(JSON.parse(ta_cache.value));\n";
    html += "awdr.render(ta_awjson.value);\n";
    html += "awdr.start();\n";
    html += "\t\t</script>\n";
    html += "\t</body>\n</html>";

    this.download_link.href = URL.createObjectURL(
        new Blob([html], {
          type: "text/html"
        })
    );
    this.download_link.setAttribute("download", "data.html");
    this.download_link.innerHTML="Download doc.";
    this.download_link.hidden = false;
};

AwDocRenderer.prototype._render = function( obj, src ) {

    // Create a div for the rendered output.
    var div = document.createElement("div");
    this.div.appendChild(div);

    obj.content = src;
    this.aw_json.push(obj);
    callback = function() {
        console.log(obj.type+" "+obj.id+" done!");
    };

    this.post( obj, div, callback );
};

AwDocRenderer.prototype._renderUsingCache = function( obj ) {
    if (obj.obj.hasOwnProperty("src")) {
        var hash = this._createHash(JSON.stringify(obj.obj.src));
        if (this.cache_map.hasOwnProperty(hash)) {
            var cache = this.cache[this.cache_map[hash]];
            this.post( cache.resp, obj.div, obj.callback );
            return true;
        }
    }
    return false;
};

