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
    this.attributes = {};
}

CacheRenderer.prototype.add = function ( section_in, section_out ) {
    var key = this.attributes[section_in.obj.type].hash_key;
    var hash = this._createHash(JSON.stringify(section_in.obj[key]));
    this.cache_map[hash] = this.cache.length;
    this.cache.push({"type": section_in.obj.type, "hash": hash, "out": section_out.obj});
};

CacheRenderer.prototype.fromObj = function ( obj ) {
    this.cache = obj.cache;
    this.attributes = obj.attributes;
    for (var i=0; i<obj.cache.length; i++) {
        var hash = obj.cache[i].hash;
        this.cache_map[hash] = i;
    }
};

CacheRenderer.prototype.registerType = function (type, attributes) {
    this.attributes[type] = attributes;
};

CacheRenderer.prototype.renderSection = function( section_in, callback ) {
    sections_out = [];
    var type = section_in.obj.type;
    if (this.attributes.hasOwnProperty(type)) {
        var key = this.attributes[type].hash_key;
        if (section_in.obj.hasOwnProperty(key)) {
            var hash = this._createHash(JSON.stringify(section_in.obj[key]));
            if (this.cache_map.hasOwnProperty(hash)) {
                var cache = this.cache[this.cache_map[hash]];
                sections_out.push({"obj": cache.out, "div": section_in.div, "callback": section_in.callback});
            }
        }
    }
    if (callback) callback(sections_out);
};

CacheRenderer.prototype.toObj = function() {
    return {"attributes": this.attributes, "cache": this.cache};
};

CacheRenderer.prototype._createHash = function( str ) {
    var hash = 0;
    var prime = 127;
    for (var i=0; i<str.length; i++) {
        hash = hash * prime + ( str.charCodeAt(i) & 0xff );
        hash |= 0; // 32-bit. JavaScript uses double float for numbers.
    }
    return hash.toString();
};

function Lock(callback) {
    this.locks = [];
    this.callback = callback;
}

Lock.prototype.lock = function() {
    var id = this.locks.length;
    this.locks.push( {"done": false} );
    return id;
};

Lock.prototype.release = function ( id ) {
    this.locks[id]["done"] = true;

    // Check if all locks released
    var done = true;
    for (var i=0; i<this.locks.length; i++) {
        if (this.locks[i].done == false) done = false;
    }
    if (done && this.callback) this.callback();
};

function Queue(callback) {
    this.queue = [];
    this.callback = callback;
    this.dispatch_enabled = true;
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

    if (this.dispatch_enabled) {
        // Dispatch on the next event cycle.
        var that = this;
        setTimeout( function(){
            that._dispatch();
        });
    }
};

Queue.prototype.disableDispatch = function () {
    this.dispatch_enabled = false;
};

Queue.prototype.enableDispatch = function () {
    this.dispatch_enabled = true;

    // Dispatch on the next event cycle.
    var that = this;
    setTimeout( function(){
        that._dispatch();
    });
};

Queue.prototype._dispatch = function () {
    var queue = this.queue;
    this.queue = [];
    while( queue.length > 0 ) {
        obj = queue.shift();
        this.callback( obj );
    }
};

function AwDocRenderer(docname, div) {
    this.doc = {"docname": docname};
    this.docname = docname;
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        document.body.appendChild(div);
    }

    this.attributes = {};
    this.aw_json = []; // Used to store all document objects for download.
    this.aw_objs = {}; // Dictionary of AwObjects keyed by id.
    this.div = div;
    this.renderers = {};
    var that = this;
    this.queue = new Queue(function(obj){
        that._dispatch(obj);
    });
    this.cnt = 0;
    this.runnable = new Runnable(this);
    this.renderers["array"] = this;
    this.renderers["json"] = this;
    this.renderers["log"] = this;
    this.async = [];
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

    // Lock for disabling rendering until all types registered.
    var that = this;
    this.rendering_lock = new Lock(function() {
        that.queue.enableDispatch();
    });
}

AwDocRenderer.prototype.doneTypes = function(id) {
    this.rendering_lock.release(id);
};

AwDocRenderer.prototype.loadScriptsSeq = function ( urls, callback ) {

    var cnt = 0;

    function loaded() {
        cnt = cnt + 1;
        if (cnt < urls.length) next();
        else if (callback) callback();
    }

    function next() {
        var script = document.createElement('script');
        script.setAttribute('src', urls[cnt]);
        script.setAttribute('type', 'text/javascript');
        script.onload = loaded;
        document.head.appendChild(script);
    }

    next();
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

AwDocRenderer.prototype.registerType = function( name, attributes, func ) {
    this.renderers[name] = func;
    this.attributes[name] = attributes;
};

AwDocRenderer.prototype.registerTypes = function( types, renderer ) {
    var keys = Object.keys(types);
    for (var i=0; i<keys.length; i++) {
        var name = keys[i];
        this.renderers[name] = renderer;
        this.attributes[name] = types[name];
    }
};

AwDocRenderer.prototype.render = function( awdoc ) {

    // Disable running all runnable sections until queue is empty. This is to allow asynchronous compilation of code to
    // complete before potential dependencies are run.
    this.post( {"type": "run_disable", "name": "awdocrenderer"} );

    var lines = awdoc.split('\n');
    var src = "";
    var obj={};
    var cnt = 0;
    for (var i = 0; i<lines.length; i++) {
        var line = lines[i];

        // Check if line is AW tag
        if (line.startsWith("AW{") && line.trim().endsWith("}")) {

            // Render the previous section
            if (cnt>0) {
                obj.content = src;
                this._render(obj);
            }

            // Get attributes of this new section
            obj = JSON.parse(line.slice(2));

            src = "";
            cnt++;
        } else {
            src=src+line+"\n";
        }
    }

    // Render remaining content
    if (cnt>0) {
        obj.content = src;
        this._render(obj);
    }
    else {
        // If no AW{...} tags then assume the doc is a JSON array.
        var array = JSON.parse(src);
        for (var i=0; i<array.length; i++) {
            this._render(array[i])
        }
    }

    this.post( {"type": "run_enable", "name": "awdocrenderer"} );
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
            this.aw_objs[obj.array[i].id] = obj.array[i];
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
};

AwDocRenderer.prototype.setServerless = function ( ) {
    this.serverless = true;
    this.url_link.hidden = true;
};

AwDocRenderer.prototype.waitTypes = function () {
    return this.rendering_lock.lock();
};

AwDocRenderer.prototype._assignId= function(obj) {
    if (obj.hasOwnProperty("id") == false) {
        // Create a default ID if one is not given
        obj.id = obj.type + "_" + this.cnt;
    }
    this.cnt++;
};

AwDocRenderer.prototype._dispatch = function(section) {
    //console.log("Dispatch:", section.obj.type, section.obj);
    var that = this;
    section.doc = this.doc; // Document globals.
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
        else if (typeof renderer.renderObj === 'function'){
            renderer.renderObj( section.obj, section.div, section.callback );
        }
        else {
            var that = this;
            renderer( section, function(sections_out) {
                that._processOutputs( section, sections_out );
            });
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
    html += "\t\t<textarea id=\"ta_cache\" hidden>\n" + JSON.stringify(this.cache.toObj()) + "\n\t\t</textarea>\n";
    html += "\t\t<script>\n";
    html += "new AwDocViewer( \"" + this.docname + "\" );\n";
    html += "\t\t</script>\n";
    html += "\t</body>\n</html>";

    this.download_link.href = URL.createObjectURL(
        new Blob([html], {
          type: "text/html"
        })
    );
    var fn = this.docname.replace(/^.*\//,''); // Remove directories from path
    fn = fn.replace(/\..*$/,''); // Remove extensions like .awdoc
    fn += ".html"
    this.download_link.setAttribute("download", fn);
    this.download_link.innerHTML="Download doc.";
    this.download_link.hidden = false;
};

AwDocRenderer.prototype._processOutputs = function ( section_in, sections_out ) {
    var type_in = section_in.obj.type;

    // Cache-able types have a hash_key attribute.
    var attributes = this.attributes[type_in] || {};
    var hash_key = attributes["hash_key"] || null;
    if (hash_key) {
        //  Cache-able - Add outputs to cache.
        this.cache.registerType(type_in, attributes);
        for (var i=0; i < sections_out.length; i++) {
            var s = sections_out[i];
            this.cache.add( section_in, s);
        }
    }

    this.postSections(sections_out);
};

AwDocRenderer.prototype._render = function( obj ) {

    // Store for creating serverless page later.
    this.aw_json.push(obj);
    this.aw_objs[obj.id] = obj;

    // Create a div for the section.
    var div = document.createElement("div");
    this.div.appendChild(div);

    // Display content source.
    var attributes = this.attributes[obj.type] || {};
    var hidden = attributes["hidden"] || false;
    if (obj.hasOwnProperty("hidden")) hidden = obj.hidden;
    if (!hidden) this._textarea(obj.content, div);

    callback = function() {
        console.log(obj.type+" "+obj.id+" done!");
    };

    this.post( obj, div, callback );
};

AwDocRenderer.prototype._textarea = function(text, div) {
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = text;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
    return ta
};

function Runnable(awdr) {
    this.awdr = awdr;
    this.disables={}; // If any items in this object are true, running is disabled and queued for later.
    this.input_sections = {};
    this.queue = [];
    this.runnables = {};
    this.types = {
        "run": {},
        "runnable": {},
        "run_enable": {},
        "run_disable": {},
        "run_section": {}
    };
    awdr.registerTypes(this.types, this);
}

Runnable.prototype.addRunnable = function ( runnable ) {
    this.runnables[runnable.id] = runnable;
    for (var i=0; i<runnable.inputs.length; i++) {
        var input_id = runnable.inputs[i];
        if (this.input_sections.hasOwnProperty(input_id) == false) {
            this.input_sections[input_id] = {"deps": [], "obj": this.awdr.aw_objs[input_id]};
        }
        this.input_sections[input_id].deps.push(runnable.id);
    }
};

Runnable.prototype.renderSection = function( section_in, callback ) {
    var type = section_in.obj.type;
    var id = section_in.obj.id;
    if (type == "run") {
        this._run( section_in, callback );
    }
    else if (type == "runnable") {
        this.addRunnable( section_in.obj );
    }
    else if (type == "run_enable") {
        this._enable( section_in, callback );
    }
    else if (type == "run_disable") {
        this._disable( section_in, callback );
    }
    else if (type == "run_section") {
        this._runDeps( id );
    }
};

Runnable.prototype._disable = function ( section_in, callback ) {
    var name = section_in.obj.name;
    this.disables[name] = true;
};

Runnable.prototype._dispatch = function () {
    while( this.queue.length > 0 ) {
        obj = this.queue.shift();
        var section_in = obj.section_in;
        var callback = obj.callback;
        var runnable = this.runnables[section_in.obj.id];
        var args = this._generateCallArgs(runnable.inputs);
        var obj_out = {"type": runnable.run, "id": runnable.id, "args": args};
        section_out = {"obj": obj_out, "div": runnable.div, "callback": section_in.callback};
        callback( [section_out] );
    }
};

Runnable.prototype._enable = function ( section_in, callback ) {
    var name = section_in.obj.name;
    delete this.disables[name];
    if (Object.keys(this.disables).length == 0) this._dispatch();
};

Runnable.prototype._generateCallArgs = function ( input_sections ) {
    // Search the specified input sections and get their content.
    ret = {};
    for (var i=0; i<input_sections.length; i++) {
        var key = input_sections[i];
        ret[key] = this.input_sections[key].obj.content;
    }
    return {"inputs": ret};
};

Runnable.prototype._run = function ( section_in, callback ) {
    var obj = {"section_in": section_in, "callback": callback};
    this.queue.push(obj);
    if (Object.keys(this.disables).length == 0) this._dispatch();
};

Runnable.prototype._runDeps = function ( id ) {
    var deps = this.input_sections[id].deps;
    for (var i=0; i<deps.length; i++) {
        var runnable_id = deps[i];
        this.awdr.post( {"type": "run", "id": deps[i]}, null, callback);
    }
};

