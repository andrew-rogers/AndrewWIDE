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
//   jsonarraybuffers.js
//   aw-sh.js
//   PlotRenderer.js
//   NavBar.js

var QueryQueue = function(url, awdoc_renderer) {
    this.url = url;
    this.awdoc_renderer = awdoc_renderer;
    this.waiting = false;
    this.queue = [];
};

QueryQueue.prototype.renderObj = function( obj, div, callback ) {
    this.queue.push({"obj":obj, "div":div, "callback":callback});
    this._next();
};

QueryQueue.prototype._next = function() {
    if (this.waiting==false) {
        if (this.queue.length > 0) {
            var obj = this.queue.shift();
            this._query( obj.obj, obj.div, obj.callback );
        }
    }
};

QueryQueue.prototype._query = function( obj, div, callback ) {
    this.waiting = true;
    var that = this;
    var xhr = new XMLHttpRequest();
	xhr.open("POST", this.url, true);
	xhr.onload = function (event) {
	    that.waiting = false;
		var response_obj=JSON.parse(xhr.response);
		that.awdoc_renderer.post( response_obj, div, callback);
		that._next();
	};
	xhr.send(JSON.stringify(obj));
};

var MonoRenderer = function() {
};

MonoRenderer.prototype.renderObj = function( obj, div, callback ) {
    // Put the content into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = obj.content;
    div.innerHTML="";
    div.appendChild(ta);
    div.style.width = "100%";
    ta.style.height = (ta.scrollHeight+8)+"px";
    if( callback ) callback();
};

var AwCppRenderer = function(docname, awdoc_renderer) {
    this.docname = docname;
    this.awdoc_renderer = awdoc_renderer;
    this.qq = new QueryQueue("/cgi-bin/awcpp.cgi", awdoc_renderer);
    this.cnt = 0;
    awdoc_renderer.registerRenderer("mono", new MonoRenderer());
    awdoc_renderer.registerRenderer("func_src", this.qq);
    awdoc_renderer.registerRenderer("func", this.qq);
};

AwCppRenderer.prototype.renderObj = function( obj, div, callback ) {
    var type = obj.type;
    if (type == "awcpp") {
        this._render( obj.content, obj.id, div, callback );
    }
};

AwCppRenderer.prototype._render = function(cpp, func_name, div, callback) {

    // Create controls
    var controls = new NavBar();
    var butt_run = document.createElement("button");
    butt_run.innerHTML="Run";
    controls.addRight(butt_run);
    controls.elem.hidden = true;
    div.appendChild(controls.elem);

    // Put the C++ source into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = cpp;
    ta.oninput = function() {controls.elem.hidden = false;};
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";

    // Create a div for the execution result
    var div_result = document.createElement("div");
    div.appendChild(div_result);

    var obj = { "type":"func_src", "module":this.docname.slice(0,-6), "func":func_name, "src":cpp };
    this.awdoc_renderer.post( obj, div_result, callback);

    var that = this;
    butt_run.onclick = function() {
        var obj = { "type":"func_src", "module":that.docname.slice(0,-6), "func":func_name, "src":ta.value };
        that.awdoc_renderer.post( obj, div_result, callback);
    }
};

