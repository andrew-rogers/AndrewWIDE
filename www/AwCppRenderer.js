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

var AwCppRenderer = function(docname, json_renderer) {
    this.docname = docname;
    this.json_renderer = json_renderer;
    this.queue = [];
    this.build_done=true;
};

AwCppRenderer.prototype.render = function(cpp, div, callback) {

    // Put the C++ source into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = cpp;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";

    // Create a div for the execution result
    var div_result = document.createElement("div");
    div.appendChild(div_result);

    // Queue the C++ code for building on the server
    this.queue.push([cpp, div.id, div_result, callback]);
    this._tryNext()
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
        var dir=fn.slice(0,-6)+"/func.d/";
        fn=dir+func_name+".awcpp";
        var script="mkdir -p '"+dir+"' && cat > '"+fn+"' && build '"+fn+"'";

	    this.build_done=false;
	    var that=this;
	    query_sh(script, cpp, function( exit_code, response ) {
		    that.build_done=true;
		    that._handle_build_response(response, div_result, callback);
	    });
	}
};

AwCppRenderer.prototype._handle_build_response = function(response, div_result, callback) {
	// TODO Handle build success/fail message and build output
	console.log(response);
	var lines = response.split("\n");
	for( var i=0; i<lines.length; i++) {
		var line=lines[i];
		if( line.substring(0,5) == "JSON{" ) {
			var obj=JSON.parse(line.substring(4));
			this._run( obj["bin"], obj["name"], div_result, callback );
		}
	}
};

AwCppRenderer.prototype._run = function(bin, func_name, div_result, callback) {
	var sh="CMD=\""+bin+"\"\n";
	var obj={cmd: "run", name: func_name};
	var that=this;
	JsonArrayBuffers.querySh(sh, obj, function( response ) {
		that._handle_run_response(response, div_result, callback);
	});
};

AwCppRenderer.prototype._handle_run_response = function(response, div_result, callback) {
    console.log(response);
    this.json_renderer.render( response, div_result, callback );
    this._tryNext();
};

