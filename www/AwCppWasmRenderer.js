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

    var hdr = "#include \"json.h\"\n\n";
    hdr += "#include <stdlib.h>\n";
    hdr += "#include <string.h>\n";
    hdr += "#include <emscripten.h>\n\n";

    hdr += "char *g_str_query;\n";

    hdr += "Json g_query;\n";
    hdr += "Json g_response;\n";

    hdr += "EMSCRIPTEN_KEEPALIVE\n";
    hdr += "extern \"C\" void set_query(char* query)\n";
    hdr += "{\n";
    hdr += "    g_str_query = (char*)malloc(strlen(query)+1);\n";
    hdr += "    if(g_str_query)\n";
    hdr += "    {\n";
    hdr += "        char* p=query;\n";
    hdr += "        char* o=g_str_query;\n";
    hdr += "        while(*p != '\0')\n";
    hdr += "            *o = (*p);\n";
    hdr += "            o++;\n";
    hdr += "            p++;\n";
    hdr += "        }\n";
    hdr += "        *o = '\0';\n";
    hdr += "    }\n";
    hdr += "}\n";

    hdr += "EMSCRIPTEN_KEEPALIVE\n";
    hdr += "extern \"C\" const char* get_response()\n";
    hdr += "{\n";
    hdr += "    std::string str;\n";
    hdr += "    g_response.stringify(str);\n";
    hdr += "    return str.c_str();\n";
    hdr += "}\n";
    this.header = hdr;
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
            this.call_queue.push({"id":obj.id, "div":div_result});
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
        this.awdr.post({"type":"awcppwasm_src","module":this.awdr.docname.slice(0,-6),"src":src}, div, callback);
    }
    if (type == "wasm-b64") {
        var ta = this._textArea( obj.content, div );
        Module.wasmBinary = Uint8Array.from(atob(obj.content), c => c.charCodeAt(0)).buffer;
        // Create a div for the execution result
        var div_result = document.createElement("div");
        div.appendChild(div_result);
        that = this;
        Module.onRuntimeInitialized = function() {

            // Call all functions in the call queue.
            for (var i=0; i<that.call_queue.length; i++) {
                var call = that.call_queue[i];
                var args = {};
                ccall("set_query","void",["string"],[JSON.stringify(args)]);
                ccall(call.id,"void",[],[]);
                var resp = ccall("get_response","string",[],[])
                that.awdr.post(JSON.parse(resp), call.div, callback);
            }
            that.call_queue=[];
        }

        // The runtime is also needed before initiliasing the wasm.
        if (this.runtime_js != "") this._insertRuntime();
    }
    if (type == "wasm-rt") {
        this.runtime_js = obj.content;

        // The wasm binary is needed before initiliasing the wasm.
        if (Module["wasmBinary"]) this._insertRuntime();
    }
};

AwCppWasmRenderer.prototype._notifyBuild = function( div, callback ) {
    if (!this.build_pending) {
        this.build_pending = true;
        this.awdr.post({"type":"awcppwasm_build"}, div, callback);
    }
};

AwCppWasmRenderer.prototype._insertRuntime = function() {
    scr = document.createElement("script");
    scr.innerText = this.runtime_js;
    document.head.appendChild(scr);
    this.build_pending = false;
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

