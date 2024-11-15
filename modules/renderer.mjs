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

export function createHash( str ) {
    var hash = 0;
    var prime = 127;
    for (var i=0; i<str.length; i++) {
        hash = hash * prime + ( str.charCodeAt(i) & 0xff );
        hash |= 0; // 32-bit. JavaScript uses double float for numbers.
    }
    return hash.toString();
}

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
};

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
    this.div = div;
    this.renderers = {};
    var that = this;

    this.cnt = 1;
    this.suspend_cnt = 0;
    this.runnable = new Runnable(this);
    this.async = [];

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

    // Export suspend and resume functions
    var that = this;
    AndrewWIDE.suspend = function(reason){
        let id = that.suspend_cnt;
        let name = "suspend_" + id;
        that.suspend_cnt++;
        that.runnable._disable(name);
        return id;
    };
    AndrewWIDE.resume = function(id){
        let name = "suspend_" + id;
        that.runnable._enable(name);
    };
    AndrewWIDE.postSections = function(sections){
        that.postSections(sections);
    };
    AndrewWIDE.queueRun = function(section) {
        that.runnable._run(section);
    }
}

AwDocRenderer.prototype.log = function(msg) {
  this.ta_log.value += msg;
  this.ta_log.hidden = false;
};

AwDocRenderer.prototype.postSections = function( sections ) {
    this.renderSections( sections );
};

AwDocRenderer.prototype.post = function ( obj, div, callback ) {
    this._dispatch({"obj":obj, "div":div, "callback":callback});
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
    // Disable running all runnable sections until all sections dispatched. This is to allow asynchronous compilation of code to
    // complete before potential dependencies are run.
    let id = AndrewWIDE.suspend( "awdocrenderer" );

    let doc = parseAwDoc( awdoc );
    for (var i=0; i<doc.length; i++) {
        let section = AndrewWIDE.createSection(doc[i]);
        section.obj.id = section.id;
        this._dispatch(section)
    }

    AndrewWIDE.resume( id );
};

AwDocRenderer.prototype.renderSections = function ( sections ) {
    if (sections.constructor.name == "Array") {
        for (var i=0; i<sections.length; i++) {
            this._dispatch(sections[i]);
        }
    }
    else {
        this._dispatch(sections);
    }
};

AwDocRenderer.prototype.setServerless = function ( ) {
    this.serverless = true;
    this.url_link.hidden = true;
};

AwDocRenderer.prototype._dispatch = function(section) {
    var renderer_name = section.obj.type;
    if (this.renderers.hasOwnProperty(renderer_name)) {
        var renderer = this.renderers[renderer_name];
        renderer(section);
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

function Runnable(awdr) {
    this.awdr = awdr;
    this.disables={}; // If any items in this object are true, running is disabled and queued for later.

    this.queue = new Queue(function(section) {
      section.func(section);
    });
}

Runnable.prototype._disable = function (name) {
    this.disables[name] = true;
    this.queue.disableDispatch();
};

Runnable.prototype._enable = function (name) {
    delete this.disables[name];
    if (Object.keys(this.disables).length == 0) this.queue.enableDispatch();
};

Runnable.prototype._run = function (section) {
    if (section.func) this.queue.post(section);
};
