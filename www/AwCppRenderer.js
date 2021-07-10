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

var QueryQueue = function(url) {
    this.url = url;
    this.waiting = false;
    this.queue = [];
};

QueryQueue.prototype.query = function( obj, callback ) {
    if (this.waiting) this.queue.push({"obj":obj, "callback":callback});
    else this._query( obj, callback );
};

QueryQueue.prototype._next = function() {
    if (this.queue.length > 0) {
        var obj = this.queue.shift();
        this._query( obj.obj, obj.callback );
    }
};

QueryQueue.prototype._query = function( obj, callback ) {
    var that = this;
    var xhr = new XMLHttpRequest();
	xhr.open("POST", this.url, true);
	xhr.onload = function (event) {
		var response_obj=JSON.parse(xhr.response);
		if( callback ) callback(response_obj);
		that.waiting = false;
		that._next();
	};
	xhr.send(JSON.stringify(obj));

    this.waiting = true;
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
    this.qq = new QueryQueue("/cgi-bin/awcpp.cgi");
    this.cnt = 0;
    awdoc_renderer.registerRenderer("mono", new MonoRenderer());
    awdoc_renderer.registerRenderer("func", this);
};

AwCppRenderer.prototype.renderObj = function( obj, div, callback ) {
    var type = obj.type;
    if (type == "awcpp") {
        this._render( obj.content, obj.id, div, callback );
    }
    else if (type == "func") {
        this._run( obj.func, div, callback );
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

    this._src(cpp, func_name, div_result, callback);

    var that = this;
    butt_run.onclick = function() {
        that._src(ta.value, func_name, div_result, callback);
    }
};

AwCppRenderer.prototype._src = function(cpp, func_name, div_result, callback) {
    var fn=this.docname;
    var obj = { "type":"src", "awdoc":fn, "func":func_name, "cpp":cpp };
    var that=this;
    this.qq.query(obj, function(response) {
        that.awdoc_renderer.post( response, div_result, callback);
    });
};

AwCppRenderer.prototype._run = function(func_name, div_result, callback) {
    var fn=this.docname;
	var obj = { "type":"run", "awdoc":fn, "func":func_name };
	var that=this;
    this.qq.query(obj, function(response) {
        that.awdoc_renderer.post( response, div_result, callback );
    });
};

