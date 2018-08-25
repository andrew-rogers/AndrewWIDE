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
    var that=this;
	Editor.call(this, div, "text/x-c++src", [{text: "Run", onclick: function(){that.run();}},{text: "Build", onclick: function(){that.build();}}])
}

CppEditor.prototype = Object.create(Editor.prototype);
CppEditor.prototype.constructor = CppEditor;

CppEditor.prototype.run = function() {
	var obj={cmd: "run"};
	obj["path"]=this.getFilename();
	JsonArrayBuffers.query("/cgi-bin/sinewave", obj, function( response ) {
		///@todo Plot response as a graph
        console.log(response);
        //updateChart([{x: 1, y: 1},{x:2,y:2},{x:3,y:3}]);
        var y=response["sin"];
        var data=[];
        for(var i=0; i<y.length; i++) data[i]={x: i, y: y[i]};
        updateChart(data);
	});
}

CppEditor.prototype.build = function() {
	var script="build "+this.getFilename();
	query_sh(script, "", function( response ) {
		///@todo Handle build success/fail message and build output
        console.log(response);
	});
}

