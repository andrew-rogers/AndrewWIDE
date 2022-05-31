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

function CacheRenderer() {
    this.cache = [];
    this.cache_map = {};
}

CacheRenderer.prototype.add = function ( section_in, section_out ) {
    var key = section_out.hash_key;
    var hash = this._createHash(JSON.stringify(section_in.obj[key]));
    this.cache_map[hash] = this.cache.length;
    this.cache.push({"in_type": section_in.obj.type, "hash": hash, "hash_key": key, "out": section_out.obj});
};

CacheRenderer.prototype.renderSection = function( section_in, callback ) {
    sections_out = [];
    if (section_in.obj.hasOwnProperty("src")) {
        var hash = this._createHash(JSON.stringify(section_in.obj.src));
        if (this.cache_map.hasOwnProperty(hash)) {
            var cache = this.cache[this.cache_map[hash]];
            sections_out.push({"obj": cache.out, "div": section_in.div, "callback": section_in.callback});
        }
    }
    if (callback) callback(sections_out);
};

CacheRenderer.prototype.setCache = function ( cache ) {
    this.cache = cache;
    for (var i=0; i<cache.length; i++) {
        var hash = cache[i].hash;
        this.cache_map[hash] = i;
    }
}

CacheRenderer.prototype._createHash = function( str ) {
    var hash = 0;
    var prime = 127;
    for (var i=0; i<str.length; i++) {
        hash = hash * prime + ( str.charCodeAt(i) & 0xff );
        hash |= 0; // 32-bit. JavaScript uses double float for numbers.
    }
    return hash.toString();
};

function Queue(callback) {
    this.queue = [];
    this.callback = callback;
}

Queue.prototype.post = function ( obj ) {
    if (obj.constructor.name == "Array") {
        for (var i=0; i<obj.length; i++) {
            this.queue.push(obj[i]);
        }
    }
    else {
        this.queue.push(obj);
    }
    var that = this;

    // Dispatch on the next event cycle.
    setTimeout( function(){
        that._dispatch();
    });
};

Queue.prototype._dispatch= function () {
    while( this.queue.length > 0 ) {
        obj = this.queue.shift();
        this.callback( obj );
    }
};

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
    var that = this;
    this.queue = new Queue(function(obj){
        that._dispatch(obj);
    });
    this.cnt = 0;
    this.running = false;
    this.renderers["array"] = this;
    this.renderers["json"] = this;
    this.renderers["log"] = this;
    this.async = [];
    this.named_sections = {};
    this.runnables = {};
    this.cache = new CacheRenderer();

    // Provide a URL for this doc. User can open it and bookmark it for quicker access.
    this.url_link = document.createElement("a");
    this.url_link.href = "AwDocViewer.html?file=" + encodeURIComponent(docname);
    this.url_link.innerHTML = docname;
    div.appendChild(this.url_link);
    var tn = document.createTextNode(" ");
    div.appendChild(tn);

    // Make download link for serverless doc but hide for now.
    this.serverless = false;
    this.download_link = document.createElement("a");
    this.download_link.hidden = true;
    div.appendChild(this.download_link);

    // Textarea for displaying log.
    this.ta_log = document.createElement("textarea");
    this.ta_log.style.width = "100%";
    this.ta_log.hidden = true;
    div.appendChild(this.ta_log);
}

AwDocRenderer.prototype.addRunnable = function ( runnable ) {
    this.runnables[runnable.id] = runnable;
    for (var i=0; i<runnable.inputs.length; i++) {
        var input_id = runnable.inputs[i];
        this._createNamedSection( input_id );
        this.named_sections[input_id].deps.push(runnable.id);
    }
};

AwDocRenderer.prototype.postSections = function( sections ) {
    for (var i=0; i<sections.length; i++) {
        this._assignId( sections[i].obj );
    }
    this.queue.post(sections);
};

AwDocRenderer.prototype.post = function ( obj, div, callback ) {
    this._assignId(obj);
    this.queue.post({"obj":obj, "div":div, "callback":callback});
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
        var sections = [];
        for (var i=0; i<obj.array.length; i++) {
            var new_div = document.createElement("div");
            if (obj.array[i]["hidden"]==true) new_div.hidden = true;
            div.appendChild(new_div);
            this._assignId(obj.array[i]);
            sections.push({"obj":obj.array[i], "div": new_div, "callback": callback});
        }
        this.queue.post(sections);
    }
    else if (type == "json") {
        var new_obj = JSON.parse(obj.content);
        this.post( { "type":"array", "array":new_obj }, div, callback);
    }
    else if (type == "log") {
        this.ta_log.value += obj.msg;
        this.ta_log.hidden = false;
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

AwDocRenderer.prototype.setServerless = function ( ) {
    this.serverless = true;
    this.url_link.hidden = true;
}

AwDocRenderer.prototype._assignId= function(obj) {
    if (obj.hasOwnProperty("id")) {
        // If section has an ID store it for later referencing.
        this._createNamedSection( obj.id );
        this.named_sections[obj.id].obj = obj;
    }
    else {
        // Create a default ID if one is not given
        obj.id = obj.type + "_" + this.cnt;
    }
    this.cnt++;
}

AwDocRenderer.prototype._createNamedSection = function( name ) {

    // Create the named section if it doesn't exist
    if (this.named_sections.hasOwnProperty(name) == false) this.named_sections[name] = {"obj": {}, "deps": []};
};

AwDocRenderer.prototype._dispatch = function(section) {
    var that = this;
    this.cache.renderSection( section, function(sections_out) {
        if (sections_out.length == 0) {
            that._dispatchRenderer(section);
        }
        else that.postSections(sections_out);
    });
};

AwDocRenderer.prototype._dispatchRenderer = function(section) {
    var renderer_name = section.obj.type;
    if (this.renderers.hasOwnProperty(renderer_name)) {
        var renderer = this.renderers[renderer_name];
        if (typeof renderer.renderSection === 'function') {
            var that = this;
            renderer.renderSection( section, function(sections_out) {
                that._processOutputs( section, sections_out );
            });
        }
        else {
            renderer.renderObj( section.obj, section.div, section.callback );
        }
    }
    else {
        var ta = document.createElement("textarea");
        ta.value = "Error: No renderer for '" + renderer_name + "'\n";
        ta.value += JSON.stringify(section.obj);
        ta.style.width = "100%";
        section.div.appendChild(ta);
    }
};

AwDocRenderer.prototype._prepareServerlessDoc = function( obj, src ) {
    var html = "<!DOCTYPE html>\n<html>\n\t<head>\n";
    html += "\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" charset=\"UTF-8\">\n";
    html += "\t\t<script src=\"AwAll.js\"></script>\n";
    html += "\t</head>\n\t<body>\n"
    html += "\t\t<textarea id=\"ta_awjson\" hidden>\n" + JSON.stringify(this.aw_json) + "\n\t\t</textarea>\n";
    html += "\t\t<textarea id=\"ta_cache\" hidden>\n" + JSON.stringify(this.cache.cache) + "\n\t\t</textarea>\n";
    html += "\t\t<script>\n";
    html += "new AwDocViewer( \"" + this.docname + "\" );\n";
    html += "\t\t</script>\n";
    html += "\t</body>\n</html>";

    this.download_link.href = URL.createObjectURL(
        new Blob([html], {
          type: "text/html"
        })
    );
    this.download_link.setAttribute("download", "AwDoc.html");
    this.download_link.innerHTML="Download doc.";
    this.download_link.hidden = false;
};

AwDocRenderer.prototype._processOutputs = function ( section_in, sections_out ) {
    for (var i=0; i < sections_out.length; i++) {
        var s = sections_out[i];
        if (s.hasOwnProperty("hash_key")) {
            this.cache.add( section_in, s);
        }
    }
    this.postSections(sections_out);
};

AwDocRenderer.prototype._render = function( obj, src ) {

    // Create a div for the rendered output.
    var div = document.createElement("div");
    if (obj["hidden"]==true) div.hidden = true;
    this.div.appendChild(div);

    obj.content = src;
    this.aw_json.push(obj);
    callback = function() {
        console.log(obj.type+" "+obj.id+" done!");
    };

    this.post( obj, div, callback );
};

