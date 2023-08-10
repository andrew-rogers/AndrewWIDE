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

// Global runtime support.
wasm = null;

var AwCppWasmRenderer = function(awdr) {
    this.awdr = awdr;
    this.runtime_js = "";
    this.build_pending = false;
    this.blocks = {};
    this.cpp_src = "";
    this.globals_block = "";
    awdr.registerRenderer("awcppwasm_build", this);
    awdr.registerRenderer("wasm", this);
    awdr.registerRenderer("awcppwasm_run", this);
    this.async_id = awdr.registerAsync(this);
    this.header = "#include \"wasm_buffers.h\"\n\n";
    this.module = "";
    this.interfaces = {};
    wasm = new WasmRuntime();
};

AwCppWasmRenderer.prototype.addInterface = function( name, i ) {
    this.interfaces[name] = i;
};

AwCppWasmRenderer.prototype.renderSection = function( section_in, callback ) {
    this.module = section_in.doc.docname.slice(0,-6);
    var type = section_in.obj.type;
    if (type == "awcppwasm") {
        this._awcppwasm(section_in, callback);
    }
    else if (type == "awcppwasm_build") {
        this._build(section_in, callback);
    }
    else if (type == "awcppwasm_run") {
        this._run(section_in, callback);
    }
    else if (type == "wasm") {
        this._wasm(section_in, callback);
    }
};

AwCppWasmRenderer.prototype._awcppwasm = function( section_in, callback ) {
    var obj = section_in.obj;
    var div = section_in.div;
    var sections_out = [];

    // Disable run
    var s = {"div": div_result, "callback": section_in.callback};
    s.obj = {"type": "run_disable", "name": "awcppwasm"};
    sections_out.push(s);

    var id = obj.id;
    if (id == "globals") {
        this.globals_block += obj.content;
    }
    else if (id=="mk") {
        if(this.awdr.serverless == false) {
            s = {"div": section_in.div, "callback": section_in.callback};
            s.obj = {"type":"func_src","module":this.module,"src":obj.content,"func":"mk"};
            sections_out.push(s);
        }
    }
    else {
        if (obj.hasOwnProperty("interface")) this.cpp_src += this.interfaces[obj.interface].genCpp(obj);
        else this.blocks[id] = obj.content;
        // Create a div for the execution result
        var div_result = document.createElement("div");
        div.appendChild(div_result);
        if (obj.hasOwnProperty("inputs")==false) obj.inputs = [];

        // Create a runnable for this C++ function.
        var s = {"div": div_result, "callback": section_in.callback};
        s.obj = {"type": "runnable", "id":obj.id, "inputs": obj.inputs, "div":div_result, "run": "awcppwasm_run"};
        sections_out.push(s);

        // Queue the run for this C++ function.
        var s = {}
        s.obj = {"type": "run", "id": obj.id};
        sections_out.push(s);
    }

    if (!this.build_pending) {
        this.build_pending = true;
        var s = {"div": div, "callback": section_in.callback};
        s.obj = {"type":"awcppwasm_build"};
        sections_out.push(s);
    }
    callback( sections_out );
};

AwCppWasmRenderer.prototype._build = function( section_in, callback ) {
    var src = this.header + this.globals_block;
    var keys = Object.keys(this.blocks);
    for (var i=0; i<keys.length; i++) {
        var id = keys[i];
        src += "EMSCRIPTEN_KEEPALIVE\n";
        src += "extern \"C\" void "+id+"()\n";
        src += "{\n";
        src += this.blocks[id];
        src += "}\n\n";
    }
    src += this.cpp_src;
    this.build_pending = false;
    section_out = {"div": section_in.div, "callback": section_in.callback};
    section_out.obj = {"type":"awcppwasm_src","module":this.module,"src":src}
    callback( [section_out] );
};

AwCppWasmRenderer.prototype._run = function( section_in, callback ) {
    var inputs = section_in.obj.args.inputs;
    var keys = Object.keys(inputs);
    wasm.clearBuffers();
    for (var i=0; i<keys.length; i++) wasm.addInputString(inputs[keys[i]]);
    wasm.addInputString(keys.join(","));

    //ccall(section_in.obj.id,"void",[],[]);
    wasm.callCFunc(section_in.obj.id);
    // Get response objects from WasmRuntime
    var sections_out = [];
    wasm.getResponse( section_in, sections_out )

    callback( sections_out );
};

AwCppWasmRenderer.prototype._wasm = function( section_in, callback) {
    var obj = section_in.obj;
    var binary = Uint8Array.from(atob(obj.b64), c => c.charCodeAt(0)).buffer;
    this.runtime_js = obj.rt_js || "";

    var postInit = function() {

        // Enable run
        var s = {};
        s.obj = {"type": "run_enable", "name": "awcppwasm"};
        callback( [s] );
    }

    var postInitEmJs = function() {
        wasm.setMemory(window.buffer);
        postInit();
    }

    if (this.runtime_js === "") {
        wasm.initialise(binary, postInit);
    }
    else {
        // Setup Module object for Emscripten JS runtime.
        window.Module = {wasmBinary: binary, onRuntimeInitialized: postInitEmJs};

        // Create script element and inject the JavaScript
        scr = document.createElement("script");
        scr.innerText = this.runtime_js;
        document.head.appendChild(scr);
    }

    this.build_pending = false;
    this.awdr.renderingComplete(this.async_id);
};

