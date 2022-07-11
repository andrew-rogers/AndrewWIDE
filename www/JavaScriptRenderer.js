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

var JavaScriptRenderer = function(awdoc_renderer) {
    this.types = {
        "javascript": {},
        "javascript_run": {}
    };
    awdoc_renderer.registerTypes(this.types, this);
    this.jss = new JavaScriptScope();
    var that = this;
    this.addFunction( "plot", function( data ) {
        var section_in = that._input;
        var s = {"div": section_in.div, "callback": section_in.callback};
        s.obj = {"type": "plot", "data": [{"y":data}]};
        that._outputs.push(s);
    });
    this.src = {}; // Used to store src sections for later evalution.
};

JavaScriptRenderer.import = {}; // Used to store imported functions used by JavaScript sections.

JavaScriptRenderer.prototype.addFunction = function( id, func ) {
    JavaScriptRenderer.import[id] = func;
    this.jss.addScope("var " + id + "=JavaScriptRenderer.import." + id + ";\n");
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
    this.src[id] = src;
};

JavaScriptRenderer.prototype._javascript = function( section_in, callback ) {
    var obj = section_in.obj;
    var div = section_in.div;

    // Create controls
    var controls = new NavBar();
    var butt_run = document.createElement("button");
    butt_run.innerHTML="Run";
    controls.addRight(butt_run);
    controls.elem.hidden = true;
    div.appendChild(controls.elem);

    // Textarea
    var ta = this._textArea( obj.content, div );

    // Define event handler functions.
    var that = this;
    butt_run.onclick = function() {
        // Update source from textarea;
        that._addFunc( obj.id, ta.value );

        // Queue the run.
        var run = {};
        run.obj = { "type": "run", "id": obj.id };
        callback( [run] );
    }
    ta.oninput = function() {controls.elem.hidden = false;};

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
    this._input = section_in;
    this._outputs = [];
    this.jss.eval(this.src[id]);
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

var JavaScriptScope = function() {
    this.scope_src = "";
    this.pre_src=""; // Prefixed to the evaluated source.
    this.post_src=""; // Suffixed to the evaluated source.
    this.scope=null;
};

JavaScriptScope.prototype.addScope = function ( src ) {
    this.scope_src += src;
    this.scope=null; // Flag that the scope needs to be recompiled.
};

JavaScriptScope.prototype.eval = function(src) {
    if (this.scope==null) this._createScope();
    return this.scope( this.pre_src + src + this.post_src );
};

JavaScriptScope.prototype._createScope = function() {
    // Create a function from the scope source.
    this.scope_func = Function("\"use strict\";" + this.scope_src + "return function(src) {\neval(src);\n};\n");

    // Run the scope function to instantiate the required scope variables.
    this.scope = this.scope_func();
};

