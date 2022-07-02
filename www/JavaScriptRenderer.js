/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2022  Andrew Rogers
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

var pagejs = {};

var JavaScriptRenderer = function(awdoc_renderer) {
    this.types = {
        "javascript": {},
        "javascript_run": {}
    };
    awdoc_renderer.registerTypes(this.types, this);
    this.pagejs_vars = "var plot = pagejs.plot;\n";
    var that = this;
    pagejs.plot = function( data ) {
        var section_in = that._input;
        var s = {"div": section_in.div, "callback": section_in.callback};
        s.obj = {"type": "plot", "data": [{"y":data}]};
        that._outputs.push(s);
    };
};

JavaScriptRenderer.prototype.addFunction = function( id, src ) {
    this.pagejs_vars += "var " + id + "=pagejs." + id + ";\n";
    pagejs[id] = Function(this.pagejs_vars + src);
};

JavaScriptRenderer.prototype.renderSection = function( section_in, callback ) {
    var type = section_in.obj.type;
    if (type == "javascript") {
        this._javascript(section_in, callback);
    }
    else if (type == "javascript_run") {
        this._run(section_in, callback);
    }
};

JavaScriptRenderer.prototype._addFunc = function( id, src ) {
    pagejs[id] = Function(this.pagejs_vars + src);
};

JavaScriptRenderer.prototype._javascript = function( section_in, callback ) {
    var obj = section_in.obj;
    var div = section_in.div;
    this._textArea( obj.content, div );

    this._addFunc( obj.id, obj.content );

    var sections_out = [];

    // Create a div for the execution result
    var div_result = document.createElement("div");
    div.appendChild(div_result);
    if (obj.hasOwnProperty("inputs")==false) obj.inputs = [];
    s = {"div": div_result, "callback": section_in.callback};
    s.obj = {"type": "runnable", "id":obj.id, "inputs": obj.inputs, "div":div_result, "run": "javascript_run"};
    sections_out.push(s);

    // Queue the run
    run = {}
    run.obj = {"type": "run", "id": obj.id};
    sections_out.push(run);

    callback( sections_out );
};

JavaScriptRenderer.prototype._run = function( section_in, callback ) {
    var id = section_in.obj.id;
    var f = pagejs[id];
    this._input = section_in;
    this._outputs = [];
    f();
    callback(this._outputs);
};

JavaScriptRenderer.prototype._textArea = function( text, div ) {
    // Put the text into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = text;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
    return ta;
};

