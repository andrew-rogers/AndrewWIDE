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

var FilterInterface = function(js_renderer) {
    this.js_renderer = js_renderer;
};

FilterInterface.prototype.genCpp = function( obj ) {
    var cpp=this._cpp( obj );
    var that = this;
    this.js_renderer.addFunction( obj.id, function(x) {
        return that._call( obj, x );
    });
    return cpp;
};

FilterInterface.prototype._call = function( obj, x ) {
    var bs = obj.bs;
    var cfunc = wasm.cfunc(obj.id);
    var p_in = wasm.stackAlloc(bs*4);
    var p_out = wasm.stackAlloc(bs*4);
    var y=[];
    var i=0;
    for (i=0; i<=x.length-bs; i+=bs) {
        wasm.writeF32(x.slice(i,i+bs), p_in);
        cfunc(p_in, p_out, bs);
        y=y.concat(wasm.readF32(p_out, bs));
    }
    wasm.writeF32(x.slice(i,x.length), p_in);
    cfunc(p_in, p_out, bs);
    y=y.concat(wasm.readF32(p_out, x.length-i));
    wasm.stackRestore();
    return y;
};

FilterInterface.prototype._cpp = function( obj ) {
    var ret = "";
    ret += "EMSCRIPTEN_KEEPALIVE\n";
    ret += "extern \"C\" void "+obj.id+"( float* _input, float* _output, size_t _num )\n";
    ret += "{\n";
    ret += "    Array<float> input(_input, _num);\n";
    ret += "    Array<float> output(_output, _num);\n";
    ret += obj.content;
    ret += "}\n\n";
    return ret;
};

