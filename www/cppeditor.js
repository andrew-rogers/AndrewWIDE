/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2018  Andrew Rogers
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

function CppEditor(div) {
	this.bin=""
	this.func_name=""
	var that=this;
	Editor.call(this, div, "text/x-c++src", [{text: "Run", onclick: function(){that.run();}},{text: "Build", onclick: function(){that.build();}}])
}

CppEditor.prototype = Object.create(Editor.prototype);
CppEditor.prototype.constructor = CppEditor;

CppEditor.prototype.run = function() {
	var sh="CMD=\""+this.bin+"\"\n";
	var obj={cmd: "run"};
	obj["path"]=this.getFilename();
	if( this.func_name != undefined )obj["name"]=this.func_name;
	var that=this;
	JsonArrayBuffers.querySh(sh, "/cgi-bin/exec_bin.sh", obj, function( response ) {
		that.handle_run_response(response);
	});
}

CppEditor.prototype.handle_run_response = function(response) {
	console.log(response);
	var g0=response[0];
	var y=g0["data"];
	var data=[];
	for(var i=0; i<y.length; i++) data[i]={x: i, y: y[i]};
	updateChart(data);
}

CppEditor.prototype.build = function() {
	var script="build "+this.getFilename();
	var that=this;
	query_sh(script, "", function( exit_code, response ) {
		that.handle_build_response(response);
	});
}

CppEditor.prototype.handle_build_response = function(response) {
	///@todo Handle build success/fail message and build output
	console.log(response);
	var lines = response.split("\n");
	for( var i=0; i<lines.length; i++) {
		var line=lines[i];
		if( line.substring(0,5) == "JSON{" ) {
			var obj=JSON.parse(line.substring(4));
			this.bin=obj["bin"];
            this.func_name=obj["name"];
		}
	}
}

