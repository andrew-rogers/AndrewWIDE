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
};

WasmRuntime.prototype.addInputString = function( string ) {
    var size = string.length*4+1;
    buf = this.allocInput( size );
    this.writeString( string, buf );
};

WasmRuntime.prototype.allocInput = function( num_bytes ) {
    var func = this.cfunc( "alloc_input" );
    return func(num_bytes);
};

WasmRuntime.prototype.cfunc = function( func_name ) {
    return getCFunc( func_name );
};

WasmRuntime.prototype.clearBuffers = function() {
    var func = this.cfunc( "clear_buffers" );
    func();
};

WasmRuntime.prototype.readF32 = function( address, num ) {
    return Array.from(HEAPF32.slice(address>>2, (address>>2)+num));
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

WasmRuntime.prototype.writeF32 = function( arr, address ) {
    HEAPF32.set( arr, address >> 2 );
};

WasmRuntime.prototype.writeString = function( string, address ) {
    stringToUTF8( string, address, string.length*4+1 );
};
