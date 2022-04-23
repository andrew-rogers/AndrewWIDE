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
};

AwCppWasmRenderer.prototype.renderObj = function( obj, div, callback ) {
    var type = obj.type;
    if (type == "awcppwasm") {
        this._textArea( obj.content, div );
        // Add the C++ source to the module
        // TODO: depending on whether this is a global section or function section, generate wrapper code.
        Module.wasmCpp = obj.content;
        this.awdr.post({"type":"awcppwasm_src","module":this.awdr.docname.slice(0,-6),"src":Module.wasmCpp}, div, callback);
    }
    if (type == "wasm-b64") {
        var ta = this._textArea( obj.content, div );
        Module.wasmBinary = Uint8Array.from(atob(obj.content), c => c.charCodeAt(0)).buffer;
        // Create a div for the execution result
        var div_result = document.createElement("div");
        div.appendChild(div_result);
        that = this;
        Module.onRuntimeInitialized = function() {
            args={};
            ccall("set_query","void",["string"],[JSON.stringify(args)]);
            ccall("myplot","void",[],[]);
            resp = ccall("get_response","string",[],[])
            that.awdr.post(JSON.parse(resp), div_result, callback);
        }
    }
    if (type == "wasm-rt") {
        scr = document.createElement("script");
        scr.innerText = obj.content;
        document.head.appendChild(scr);
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

