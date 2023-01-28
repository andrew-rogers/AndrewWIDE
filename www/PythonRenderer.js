/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2023  Andrew Rogers
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

var pyodide=null; // Make this global so it can be easily accessed from console.

var PythonRenderer = function(awdoc_renderer) {

    // Supported message types.
    this.types = {
        "python": {},
        "python_run": {}
    };
    awdoc_renderer.registerTypes(this.types, this);

    this.blocks = {}; // Store the Python scripts so they can be run separately.
    this.pyodide = null;
    this.status = null;
};

PythonRenderer.prototype.renderSection = function( section_in, callback ) {
    this.module = section_in.doc.docname.slice(0,-6);
    var type = section_in.obj.type;
    if (type == "python") {
        this._python(section_in, callback);
    }
    else if (type == "python_run") {
        this._run(section_in, callback);
    }
};

PythonRenderer.prototype._loadPyodide = function( callback ) {
    this.status = "Loading pyodide javascript";

    var that = this;

    var get_js = function (url, callback) {
        that.status = "Getting Pyodide javascript";
        var script = document.createElement('script');
        script.setAttribute('src', url);
        script.setAttribute('type', 'text/javascript');
        script.onload = function() {
            callback();
        };
        window.document.head.appendChild(script);
    };

    var loaded = function() {
        that.status = "Loaded";
        pyodide = that.pyodide; // Set the global.
        // Enable run
        var s = {};
        s.obj = {"type": "run_enable", "name": "python"};
        callback( [s] );
    };

    async function got_py_js() {
        console.log("Got pyodide.js.");
        that.status = "Loading pyodide";
        that.pyodide = await loadPyodide();
        console.log("Pyodide loaded.");
        that.status = "Loading scipy package";
        await that.pyodide.loadPackage("scipy");
        console.log("Package scipy loaded");
        loaded();
    }

    get_js("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js", got_py_js);
};

PythonRenderer.prototype._python = function( section_in, callback ) {
    var obj = section_in.obj;
    var div = section_in.div;
    this._textArea( obj.content, div );
    var sections_out = [];

    var id = obj.id;

    // Store script
    this.blocks[id] = obj.content;
    // Create a div for the execution result
    var div_result = document.createElement("div");
    div.appendChild(div_result);
    if (obj.hasOwnProperty("inputs")==false) obj.inputs = [];

    // Disable run
    var s = {"div": div_result, "callback": section_in.callback};
    s.obj = {"type": "run_disable", "name": "python"};
    sections_out.push(s);

    // Create a runnable for this python chunk.
    var s = {"div": div_result, "callback": section_in.callback};
    s.obj = {"type": "runnable", "id":obj.id, "inputs": obj.inputs, "div":div_result, "run": "python_run"};
    sections_out.push(s);

    // Queue the run for this python chunk.
    var s = {}
    s.obj = {"type": "run", "id": obj.id};
    sections_out.push(s);

    if (!this.status) {
        this._loadPyodide(callback);
    }

    callback( sections_out );
};

PythonRenderer.prototype._run = function( section_in, callback ) {
    var inputs = section_in.obj.args.inputs;
    var keys = Object.keys(inputs);

    // TODO: Process the inputs.

    var id = section_in.obj.id;
    var src = this.blocks[id];
    this.pyodide.runPython(src);

    // TODO: Process the outputs.

    callback( sections_out );
};

PythonRenderer.prototype._textArea = function( text, div ) {
    // Put the text into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = text;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
    return ta
};

