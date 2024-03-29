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

var WasmRuntime = function() {
    this.stack=0;
    this.meta = {};
    this.module = {};
    this.response_cmds = []; // Response commands.
    this._createImports();
    AndrewWIDE.wasm_rt = this;
};

WasmRuntime.prototype.addInputString = function( string ) {
    var size = string.length*4+1;
    buf = this.allocInput( size );
    this.writeString( string, buf );
};

WasmRuntime.prototype.addResponseCommand = function( cmd ) {
    var obj = JSON.parse(cmd);
    this.response_cmds.push(obj);
};

WasmRuntime.prototype.allocInput = function( num_bytes ) {
    var func = this.cfunc( "alloc_input" );
    return func(num_bytes);
};

WasmRuntime.prototype.callCFunc = function( func_name ) {
    console.log("Wasm not initialised."); // Re-defined in initialise().
};

WasmRuntime.prototype.cfunc = function( func_name ) {
    console.log("Wasm not initialised."); // Re-defined in initialise().
};

WasmRuntime.prototype.clearBuffers = function() {
    var func = this.cfunc( "clear_buffers" );
    func();
};

WasmRuntime.prototype.getResponse = function ( section_in, sections_out ) {
    var ptr = this.cfunc("generate_responses")();
    console.log(this.response_cmds);
    var output_vectors = WasmVectors.dict.noutput_vectors;
    for (var i=0; i<this.response_cmds.length; i++) {
        var obj = this.response_cmds[i];
        var cmd = obj.cmd;
        if (cmd == "plot") {
            var s = {"div": section_in.div, "callback": section_in.callback};
            s.obj = obj;
            s.obj["type"]="plot";

            // Get the vectors for each of the traces in data.
            for (var i=0; i<obj.data.length; i++) {
                var trace = s.obj.data[i];
                if (trace.hasOwnProperty("vecname_x"))
                {
                    var vec = output_vectors.get(trace.vecname_x);
                    trace["x"] = vec.list();
                }
                if (trace.hasOwnProperty("vecname_y"))
                {
                    var vec = output_vectors.get(trace.vecname_y);
                    trace["y"] = vec.list();
                }
            }

            if (obj.hasOwnProperty( "wasmvectors" )) this._getVectors( obj.wasmvectors, s.obj );

            sections_out.push(s);
        }
        else if (cmd == "print") {
            var s = {"div": section_in.div, "callback": section_in.callback};
            s.obj = obj;
            s.obj["type"]="print";
            sections_out.push(s);
        }
    }
    this.response_cmds = [];
};

WasmRuntime.prototype.getReturnValues = function () {
    var ptr = this.cfunc("get_return_values")();
    return this.read("U32", ptr, 8);
};

WasmRuntime.prototype.initialise = function (binary, postInit) {

    // Re-assign the C function lookup function.
    var mod = this.module;
    this.cfunc = function (func_name) {
        return mod.exports[func_name];
    };
    this.callCFunc = function (func_name) {
        var func = mod.exports[func_name];
        func();
    }

    // Instantiate the wasm.
    var that = this;
    WebAssembly.instantiate(binary, mod.imports)
    .then((result) => {
        mod.exports = result.instance.exports;

        // Typed array representations for memory.
        that.setMemory(mod.exports.memory.buffer);

        // Initialise the wasm.
        mod.exports._initialize();
        AndrewWIDE.wasm = mod;
        if (postInit) postInit();
    });
};

WasmRuntime.prototype.read = function( type, address, num ) {
    var mem = this.module.mem[type];
    var index = address >> mem.address_shift;
    return Array.from(mem.buf.slice(index, index + num));
};

WasmRuntime.prototype.readString = function( cstr ) {
    var heap = this.module.memUint8;
    var str = "";
    if (cstr==0) return "";
    var i = cstr;
    while (heap[i] > 0) str += String.fromCharCode(heap[i++]);
    return str
};

WasmRuntime.prototype.setMemory = function(buffer) {
    var mod = this.module;
    mod.memFloat32 = new Float32Array(buffer);
    mod.memFloat64 = new Float64Array(buffer);
    mod.memInt32   = new Int32Array  (buffer);
    mod.memUint8   = new Uint8Array  (buffer);
    mod.memUint32  = new Uint32Array (buffer);

    mod.mem = {
        F32: {buf: mod.memFloat32, address_shift: 2},
        F64: {buf: mod.memFloat64, address_shift: 3},
        S32: {buf: mod.memInt32,   address_shift: 2},
        U8:  {buf: mod.memUint8,   address_shift: 0},
        U32: {buf: mod.memUint32,  address_shift: 2}
    };
};

WasmRuntime.prototype.setMeta = function( ptr, key, value )
{
    var objkey = "p"+ptr; // Convert pointer to string and prefix with p.
    if (this.meta.hasOwnProperty(objkey) == false) this.meta[objkey] = {};
    this.meta[objkey][key] = value;
};

WasmRuntime.prototype.stackAlloc = function( num_bytes ) {
    if (this.stack==0) this.stack = stackSave();

    // stackAlloc returns 16-byte aligned addresses so should be good for all types.
    return stackAlloc( num_bytes );
};

WasmRuntime.prototype.stackRestore = function() {
    if (this.stack!=0) stackRestore( this.stack );
    this.stack=0; 
};

WasmRuntime.prototype.write = function( type, arr, address ) {
    var mem = this.module.mem[type];
    var index = address >> mem.address_shift;
    mem.set( arr, index );
};

WasmRuntime.prototype.writeString = function( string, address ) {
    var index = address;
    var mem = this.module.memUint8;
    for (var i = 0; i < string.length; i++) {
        mem[index++] = string.charCodeAt(i);
    }
    mem[index] = 0; // C strings are null terminated.
};

WasmRuntime.prototype._createImports = function() {
    var env = {};
    var that = this;
    env.emjs_add_js_func = function(name, src) {
        AndrewWIDE.js_funcs = AndrewWIDE.js_funcs || {};
        AndrewWIDE.js_funcs[that.readString(name)] = new Function('ptr', that.readString(src));
    };

    env.emjs_add_response_cmd = function(src) {
        wasm.addResponseCommand(that.readString(src));
    };

    env.emjs_add_wasm_vectors = function(name, ptr) {
        new WasmVectors(that.readString(name), ptr);
    };

    env.emjs_call_js_func = function(name, ptr) {
        return AndrewWIDE.js_funcs[that.readString(name)](ptr);
    };

    env.emjs_call_wasmjs = function(module, func, ptr) {
        return AndrewWIDE.wasmjs[that.readString(module)][that.readString(func)](ptr);
    };

    env.emjs_wasm_vectors_add = function(p_wvs, name, ptr, type) {
        var wvs = WasmVectors.dict["p"+p_wvs]; // Lookup the WasmVectors to add the WasmVector to.
        wvs.addPtr(that.readString(name), ptr, type);
    };

    env.emjs_console_log = function(p_str) {
        console.log(that.readString(p_str));
    };

    var wsp = {};

    wsp.fd_close = function() {
        console.log("Not yet implemented");
    };

    wsp.fd_write = function() {
        console.log("Not yet implemented");
    };

    wsp.fd_seek = function() {
        console.log("Not yet implemented");
    };

    wsp.proc_exit = function() {
        console.log("Not yet implemented");
    };

    this.module.imports = {env: env, wasi_snapshot_preview1: wsp};
};

WasmRuntime.prototype._getVectors = function( vecs, obj ) {
    var output_vectors = WasmVectors.dict.noutput_vectors;
    for (var i=0; i<vecs.length; i++) {
        var vec = output_vectors.get(vecs[i].vec_name);
        var mat = this._toMatrix(vec, vecs[i].dim);
        var str = "obj." + vecs[i].member + "=mat";
        eval(str);
    }
};

WasmRuntime.prototype._toMatrix = function( vec, dim ) {
    var n_rows = dim[0];
    var n_cols = dim[1];
    var mat = [];
    var l = vec.list();
    for (var c=0; c<n_cols; c++) {
        var col = [];
        for (var r=0; r<n_rows; r++) {
            col.push(l[c*n_rows+r]);
        }
        mat.push(col);
    }
    return mat;
};

