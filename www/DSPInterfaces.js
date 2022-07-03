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
    x[2]=0.5;
    var cfunc = obj.id;
    // TODO: Call C++ filter function repeatedly until enitre list is processed.
    var stack = stackSave();
    // stackAlloc returns 16-byte aligned addresses.
    var p_in = stackAlloc(obj.bs*4);
    var p_out = stackAlloc(obj.bs*4);
    stackRestore(stack);
    return x;
};

FilterInterface.prototype._cpp = function( obj ) {
    var ret = "";
    ret += "EMSCRIPTEN_KEEPALIVE\n";
    ret += "extern \"C\" void "+obj.id+"( float* _input, float* _output )\n";
    ret += "{\n";
    ret += "    Array<float> input(_input, " + obj.bs + ");\n";
    ret += "    Array<float> output(_output, " + obj.bs + ");\n";
    ret += obj.content;
    ret += "}\n\n";
    return ret;
};

