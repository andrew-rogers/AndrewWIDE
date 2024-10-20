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

export function parseAwDoc( awdoc ) {

    let ret = [];

    var lines = awdoc.split('\n');
    var src = "";
    var obj={};
    var cnt = 0;
    for (var i = 0; i<lines.length; i++) {
        var line = lines[i];

        // Check if line is AW tag
        if (line.startsWith("AW{") && line.trim().endsWith("}")) {

            // Push the previous section
            if (cnt>0) {
                obj.content = src;
                ret.push(obj);
            }

            // Get attributes of this new section
            obj = JSON.parse(line.slice(2));

            src = "";
            cnt++;
        } else {
            src=src+line+"\n";
        }
    }

    // Push remaining content
    if (cnt>0) {
        obj.content = src;
        ret.push(obj);
    }
    else {
        // If no AW{...} tags then assume the doc is a JSON array.
        ret = JSON.parse(src);
    }

    return ret;
}


function CacheRenderer() {
    this.cache = [];
    this.cache_map = {};
    this.attributes = {};
}

CacheRenderer.prototype.add = function ( section_in, section_out ) {
    // Only add objects that have a hash.
    if (section_in.hasOwnProperty("hash")) {
        this.cache_map[section_in.hash] = this.cache.length;
        this.cache.push({"type": section_in.obj.type, "hash": section_in.hash, "out": section_out.obj});
    }
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
    // Only store types with a hash_key.
    var attr = attributes || {};
    var hash_key = attr["hash_key"] || null;
    if (hash_key) this.attributes[type] = attr;
};

CacheRenderer.prototype.searchSection = function( section, post, notFound ) {
    var found = false;;
    var type = section.obj.type;
    if (this.attributes.hasOwnProperty(type)) {
        var key = this.attributes[type].hash_key;
        if (section.obj.hasOwnProperty(key)) {
            var hash = createHash(JSON.stringify(section.obj[key]));
            section.hash = hash;
            if (this.cache_map.hasOwnProperty(hash)) {
                var cache = this.cache[this.cache_map[hash]];
                found = true;
                post({"obj": cache.out, "div": section.div});
            }
        }
    }
    if (!found) notFound(section);
};

CacheRenderer.prototype.toObj = function() {
    return {"attributes": this.attributes, "cache": this.cache};
};

export function createHash( str ) {
    var hash = 0;
    var prime = 127;
    for (var i=0; i<str.length; i++) {
        hash = hash * prime + ( str.charCodeAt(i) & 0xff );
        hash |= 0; // 32-bit. JavaScript uses double float for numbers.
    }
    return hash.toString();
}

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
    this.queueA = [];
    this.queueB = [];
    this.in = this.queueA;
    this.dispatch = this.queueB;
    this.toggle = 0;
    this.callback = callback;
    this.dispatch_enabled = true;
    this.dispatch_pending = false;
}

Queue.prototype.post = function ( obj ) {
    if (obj.constructor.name == "Array") {
        for (var i=0; i<obj.length; i++) {
            this.in.push(obj[i]);
        }
    }
    else {
        this.in.push(obj);
    }

    this._schedule();
};

Queue.prototype.disableDispatch = function () {
  this.dispatch_enabled = false;
  this.dispatch_pending = false;
};

Queue.prototype.enableDispatch = function () {
  this.dispatch_enabled = true;
  this._schedule();
};

Queue.prototype._dispatch = function () {

  // If queue is empty then swap queues.
  if (this.dispatch.length == 0) {
    // Swap queues
    if (this.toggle == 0) {
      this.in = this.queueB;
      this.dispatch = this.queueA;
      this.toggle = 1;
    }
    else {
      this.in = this.queueA;
      this.dispatch = this.queueB;
      this.toggle = 0;
    }

    // If the new queue is not empty, schdeule a dispatch.
    if (this.dispatch.length > 0) {
      this._schedule();
    }
  } else {
    while( (this.dispatch.length > 0) && (this.dispatch_enabled) ) {
      var obj = this.dispatch.shift();
      this.callback( obj );
    }
    this._schedule();
  }
};

Queue.prototype._schedule = function () {
  if (this.dispatch_enabled && (this.dispatch_pending == false)) {
    // Dispatch on the next event cycle.
    var that = this;
    setTimeout( function(){
      that.dispatch_pending = false;
      that._dispatch();
    });
    this.dispatch_pending = true;
  }
}

export function AwDocRenderer(docname, div) {
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
    this.suspend_cnt = 0;
    this.runnable = new Runnable(this);
    this.renderers["array"] = this;
    this.renderers["json"] = this;
    this.renderers["log"] = this;
    this.async = [];
    this.cache = new CacheRenderer();
    this.wrapper_funcs = {};

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

    // Export suspend and resume functions
    AndrewWIDE.suspend = function(reason){
        let id = that.suspend_cnt;
        let name = "suspend_" + id;
        let s = {obj: {type:"run_disable", name:name}};
        that.suspend_cnt++;
        that.runnable._disable(s);
        return id;
    };
    AndrewWIDE.resume = function(id){
        let name = "suspend_" + id;
        let s = {obj: {type:"run_enable", name:name}};
        that.runnable._enable(s);
    };
    AndrewWIDE.postSections = function(sections){
        that.postSections(sections);
    };
    AndrewWIDE.queueRun = function(id) {
        let run = {}
        run.obj = {"type": "run", "id": id};
        that.postSections( [run] );
    }
    AndrewWIDE.addRunnable = function(obj, wrapper) {
        that.wrapper_funcs[obj.id] = wrapper;
        if (obj.hasOwnProperty("inputs")==false) obj.inputs = [];
        let s = {};
        s.obj = {"type": "runnable", "id":obj.id, "inputs": obj.inputs, "run": "func_run"};
        that.postSections([s]);
    };
    this.renderers.func_run = function(section) {
        let func = that.wrapper_funcs[section.obj.id];
        func(section);
    };
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
    this.cache.registerType(name, attributes);
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

    let doc = parseAwDoc( awdoc );
    for (var i=0; i<doc.length; i++) {
        this._render(doc[i])
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
    this.queue.disableDispatch();
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
    var that = this;
    section.doc = this.doc; // Document globals.
    this.cache.searchSection( section, function(section) {
        // Found in cache.
        that._assignId(section.obj);
        that.queue.post(section);
    }, function(section) {
        // Not in cache.
        that._dispatchRenderer(section);
    });
};

AwDocRenderer.prototype._dispatchRenderer = function(section) {
    var renderer_name = section.obj.type;
    if (this.renderers.hasOwnProperty(renderer_name)) {
        var renderer = this.renderers[renderer_name];
        if (typeof renderer.renderSection === 'function') {
            var that = this;
            renderer.renderSection( section, function(sections_out) {
                that.postSections( sections_out );
            });
        }
        else if (typeof renderer.renderObj === 'function'){
            renderer.renderObj( section.obj, section.div, section.callback );
        }
        else {
            var that = this;
            renderer( section, function(section_out) {
                that.cache.add(section, section_out);
                that._assignId(section_out.obj);
                that.queue.post(section_out);
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

export function createHTML(textareas) {
    let loader = `(function () {
    let name = 'AndrewWIDE.js';
    let urls = [name, 'http://andrew-rogers.github.io/AndrewWIDE/javascripts/' + name];
    let cnt = 0;

    function load() {
        let script = document.createElement('script');
        let url = urls[cnt];
        script.setAttribute('src', url);
        script.setAttribute('type', 'text/javascript');
        script.onload = function() {
            console.log("Got '" + name + "' from '" + url + "'");
            new AwDocViewer( "serverless" );
        };
        script.onerror = function(e) {
            cnt++;
            if (cnt<urls.length) load();
            else console.log("Can't load " + name);
        };
        document.head.appendChild(script);
    }
    load();
})();`;
    var html = "<!DOCTYPE html>\n<html>\n\t<head>\n";
    html += "\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" charset=\"UTF-8\">\n";
    html += "\t</head>\n\t<body>\n"
    const keys = Object.keys(textareas)
    for (let i=0; i<keys.length; i++) html += "\t\t<textarea id=\"" + keys[i] + "\" class=\"awjson\" hidden>\n" + JSON.stringify(textareas[keys[i]]) + "\n\t\t</textarea>\n";
    html += "\t\t<script>\n";
    html += loader + "\n";
    html += "\t\t</script>\n";
    html += "\t</body>\n</html>\n";
    return html
}

AwDocRenderer.prototype._prepareServerlessDoc = function( obj, src ) {
    let html = createHTML({ta_awjson: this.aw_json, ta_cache: this.cache.toObj()});

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

    var callback = function() {
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
    this.runnables = {};
    this.types = {
        "run": {},
        "runnable": {},
        "run_enable": {},
        "run_disable": {},
        "run_section": {}
    };
    awdr.registerTypes(this.types, this);
    var that = this;
    this.queue = new Queue(function(obj) {
      that._dispatch(obj);
    });
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
    this.queue.disableDispatch();
};

Runnable.prototype._dispatch = function (obj) {
  var section_in = obj.section_in;
  var callback = obj.callback;
  var runnable = this.runnables[section_in.obj.id];
  var args = this._generateCallArgs(runnable.inputs);
  var obj_out = {"type": runnable.run, "id": runnable.id, "args": args};
  var section_out = {"obj": obj_out, "div": runnable.div, "callback": section_in.callback};
  this.awdr._dispatch(section_out);
};

Runnable.prototype._enable = function ( section_in, callback ) {
    var name = section_in.obj.name;
    delete this.disables[name];
    if (Object.keys(this.disables).length == 0) this.queue.enableDispatch();
};

Runnable.prototype._generateCallArgs = function ( input_sections ) {
    // Search the specified input sections and get their content.
    var ret = {};
    for (var i=0; i<input_sections.length; i++) {
        var key = input_sections[i];
        ret[key] = this.input_sections[key].obj.content;
    }
    return {"inputs": ret};
};

Runnable.prototype._run = function ( section_in, callback ) {
    var obj = {"section_in": section_in, "callback": callback};
    this.queue.post(obj);
};

Runnable.prototype._runDeps = function ( id ) {
    var deps = this.input_sections[id].deps;
    for (var i=0; i<deps.length; i++) {
        var runnable_id = deps[i];
        this.awdr.post( {"type": "run", "id": deps[i]}, null, null);
    }
};

