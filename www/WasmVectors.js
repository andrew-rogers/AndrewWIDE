/*
 * AndrewWIDE - Vector handling for interfacing C++ sections into JavaScript.
 * Copyright (C) 2022  Andrew Rogers
 *
 * SPDX-License-Identifier: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var WasmVector = function( ptr, type ) {
    this.ptr = ptr; // Address of the WasmVector<T> instance.
    this.type = type;
    if (WasmVector.readers.length==0) {
        WasmVector.readers = [0,0,wasm.readU8, 0,0,0,0,0,0,wasm.readF32, wasm.readF64];
        WasmVector.writers = [0,0,wasm.writeU8,0,0,0,0,0,0,wasm.writeF32,wasm.writeF64];
    }
}

WasmVector.readers = [];
WasmVector.writers = [];

WasmVector.prototype.list = function() {
    wasm.cfunc("vector_data")(this.ptr);
    var rv = wasm.getReturnValues();
    var reader_func = WasmVector.readers[this.type];
    return reader_func( rv[0], rv[1] );
};

WasmVector.prototype.push = function(list) {
    var ptr = wasm.cfunc("wasm_vector_expand")(this.ptr, this.type, list.length);
    var writer_func = WasmVector.writers[this.type];
    writer_func( list, ptr );
};

var WasmVectors = function( name, ptr ) {
    this.name = name;
    this.ptr = ptr;
    this.vectors = {};
    WasmVectors.dict["p"+ptr] = this;
    WasmVectors.dict["n"+name] = this;
    if (name=="shared_vectors") window.g_shared_vectors = this;
};

WasmVectors.dict = {};

WasmVectors.prototype.createFloat32 = function (name)
{
    return this._create( name, 9 );
};

WasmVectors.prototype.createFloat64 = function (name)
{
    return this._create( name, 10 );
};

WasmVectors.prototype.createUint8 = function (name)
{
    return this._create( name, 2 );
};

WasmVectors.prototype.add = function( name, vec )
{
    this.vectors[name] = vec;
};

WasmVectors.prototype.addPtr = function (name, ptr, type)
{
    // Create WasmVector wrapper from std::vector and type.
    var vec = null;
    vec = new WasmVector( ptr, type );

    if (vec) this.vectors[name] = vec;
    return vec;
};

WasmVectors.prototype.get = function (name)
{
    return this.vectors[name];
};

WasmVectors.prototype._create = function (name, type)
{
    var ptr = wasm.cfunc("new_vector")(type);
    var vec = new WasmVector( ptr, type);
    this.add( name, vec );
    return vec;
};

