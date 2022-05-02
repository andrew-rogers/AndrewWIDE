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
 
// The Emscripten generated runtime uses a global Module object
Module = {};

var AwCppWasmRenderer = function(awdr) {
    this.awdr = awdr;
    this.runtime_js = "";
    this.build_pending = false;
    this.blocks = {};
    this.globals_block = "";
    this.call_queue=[];
    awdr.registerRenderer("awcppwasm_build", this);
    awdr.registerRenderer("wasm", this);
    this.header = "#include \"wasm.h\"\n\n";
};

AwCppWasmRenderer.prototype.renderObj = function( obj, div, callback ) {
    var type = obj.type;
    if (type == "awcppwasm") {
        this._textArea( obj.content, div );

        var id = obj.id;
        if (id == "globals") {
            this.globals_block = obj.content;
        }
        else {
            this.blocks[id] = obj.content;
            // Create a div for the execution result
            var div_result = document.createElement("div");
            div.appendChild(div_result);
            this.call_queue.push({"id":obj.id, "inputs": obj.inputs, "div":div_result});
        }
        this._notifyBuild( div, callback );
    }
    if (type == "awcppwasm_build") {
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
        this.build_pending = false;
        this._srcToWasm( src, div, callback );
    }
    if (type == "wasm") {
        Module.wasmBinary = Uint8Array.from(atob(obj.b64), c => c.charCodeAt(0)).buffer;
        this.runtime_js = obj.rt_js;
        this._insertRuntime();
    }
};

AwCppWasmRenderer.prototype._getInputs = function( inputs ) {
    // Search the awdoc sections for the specified input sections and get their content.
    ret = {};
    for (var i=0; i<inputs.length; i++) {
        var key = inputs[i];
        ret[key] = this.awdr.named_sections[key].content;
    }
    return ret;
};

AwCppWasmRenderer.prototype._insertRuntime = function() {
    that = this;
    Module.onRuntimeInitialized = function() {

        // Call all functions in the call queue.
        for (var i=0; i<that.call_queue.length; i++) {
            var call = that.call_queue[i];
            var args = {"inputs": that._getInputs(call.inputs)};
            ccall("set_query","void",["string"],[JSON.stringify(args)]);
            ccall(call.id,"void",[],[]);
            var resp = ccall("get_response","string",[],[])
            that.awdr.post(JSON.parse(resp), call.div, callback);
        }
        that.call_queue=[];
    }

    // Create script element and inject the JavaScript
    scr = document.createElement("script");
    scr.innerText = this.runtime_js;
    document.head.appendChild(scr);
    this.build_pending = false;
};

AwCppWasmRenderer.prototype._srcToWasm = function( src, div, callback ) {
    // TODO: Create hash for source and lookup stored wasm.
    // Compile if wam for source hash not found.
    this.awdr.post({"type":"awcppwasm_src","module":this.awdr.docname.slice(0,-6),"src":src}, div, callback);
};

AwCppWasmRenderer.prototype._notifyBuild = function( div, callback ) {
    if (!this.build_pending) {
        this.build_pending = true;
        this.awdr.post({"type":"awcppwasm_build"}, div, callback);
    }
};

AwCppWasmRenderer.prototype._textArea = function( text, div ) {
    // Put the text into a textarea
    var ta = document.createElement("textarea");
    ta.style.width = "100%";
    ta.value = text;
    div.appendChild(ta);
    ta.style.height = (ta.scrollHeight+8)+"px";
    return ta
};

