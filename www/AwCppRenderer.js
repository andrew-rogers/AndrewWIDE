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
//   JsonRenderer.js
//   JsonQuery.js
//   NavBar.js

var MonoRenderer = function() {
};

MonoRenderer.prototype.renderObj = function( obj, callback ) {
    // Put the content into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = obj.content;
    obj.div.innerHTML="";
    obj.div.appendChild(ta);
    obj.div.style.width = "100%";
    ta.style.height = (ta.scrollHeight+8)+"px";
    if( callback ) callback();
};

var AwCppRenderer = function(docname, json_renderer, awdoc_renderer) {
    this.docname = docname;
    this.json_renderer = json_renderer;
    this.awdoc_renderer = awdoc_renderer;
    this.queue = [];
    this.build_done = true;
    this.cnt = 0;
    awdoc_renderer.registerRenderer("mono", new MonoRenderer());
};

AwCppRenderer.prototype.render = function(cpp, div, callback) {

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

    // Queue the C++ code for building on the server
    this.queue.push([cpp, div.id, div_result, callback]);
    this._tryNext();

    var that = this;
    butt_run.onclick = function() {
        // Queue the C++ code for building on the server
        that.queue.push([ta.value, div.id, div_result, callback]);
        that._tryNext();
    }
};

AwCppRenderer.prototype._tryNext = function() {
    if (this.build_done) {
        if (this.queue.length>0) {
            var build_args = this.queue.shift();
            if (build_args) this._build(build_args[0], build_args[1], build_args[2], build_args[3]);
        }
    }
}

AwCppRenderer.prototype._build = function(cpp, func_name, div_result, callback) {
    var fn=this.docname;
    if (fn.endsWith(".awdoc")) {
        var obj = { "cmd":"build", "awdoc":fn, "func":func_name, "cpp":cpp };
        this.build_done=false;
        var that=this;
        JsonQuery.query("/cgi-bin/awcpp.cgi", obj, function(response) {
            that.build_done=true;
            if (response.error == "0" && response.bin) {
                that._run(response["bin"], response["name"], div_result, callback);
            }
            else if (response.error != "0" && response.build_log) {
                obj = { "type":"mono", "id":"awcpp_"+that.cnt, "content":response["build_log"], "div":div_result };
                that.cnt = that.cnt + 1;
                that.awdoc_renderer.post( obj );
	            if( callback ) callback();
	            that._tryNext();
	        }
	        else {
	            if( callback ) callback();
	            that._tryNext();
	        }
        });
	}
};

AwCppRenderer.prototype._run = function(bin, func_name, div_result, callback) {
	var obj = { "cmd":"run", "bin":bin, "func":func_name };
    var that=this;
    JsonQuery.query("/cgi-bin/awcpp.cgi", obj, function(response) {
        var resp = response["resp"];
        that._handle_run_response(resp, div_result, callback);
    });
};

AwCppRenderer.prototype._handle_run_response = function(response, div_result, callback) {
    console.log(response);
    this.json_renderer.render( response, div_result, callback );
    this._tryNext();
};

AwCppRenderer.prototype._viewTextInDiv = function(text, div) {
    div.innerHTML="";
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = text;
    ta.readOnly = true;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
};

