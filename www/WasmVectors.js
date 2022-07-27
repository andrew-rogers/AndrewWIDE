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

var WasmVectorFloat64 = function(ptr) {
    this.ptr = ptr | 0; // Address of the WasmVector<uint8_t> instance.
    if (this.ptr == 0) {
        this.ptr = wasm.cfunc("new_vector_double")();
    }
};

WasmVectorFloat64.prototype.list = function() {
    wasm.cfunc("vector_data")(this.ptr);
    var rv = wasm.getReturnValues();
    return wasm.readF64( rv[0], rv[1] );
};

WasmVectorFloat64.prototype.push = function(list) {
    var ptr = wasm.cfunc("wasm_vector_expand")(this.ptr, 10, list.length);
    wasm.writeF64( list, ptr );
};

var WasmVectorUint8 = function(ptr) {
    this.ptr = ptr | 0; // Address of the WasmVector<uint8_t> instance.
    if (this.ptr == 0) {
        this.ptr = wasm.cfunc("new_vector_uint8")();
    }
};

WasmVectorUint8.prototype.list = function() {
    wasm.cfunc("vector_data")(this.ptr);
    var rv = wasm.getReturnValues();
    return wasm.readU8( rv[0], rv[1] );
};

WasmVectorUint8.prototype.push = function(list) {
    var ptr = wasm.cfunc("wasm_vector_expand")(this.ptr, 2, list.length);
    wasm.writeU8( list, ptr );
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

WasmVectors.prototype.createUint8 = function (name)
{
    var vec = new WasmVectorUint8();
    this.add( name, vec );
    return vec;
};

WasmVectors.prototype.add = function( name, vec )
{
    this.vectors[name] = vec;
};

WasmVectors.prototype.addPtr = function (name, ptr, type)
{
    // Create WasmVector wrapper from std::vector and type.
    var vec = null;
    if (type==2) vec = new WasmVectorUint8(ptr);
    else if (type==10) vec = new WasmVectorFloat64(ptr);

    if (vec) this.vectors[name] = vec;
    return vec;
};

WasmVectors.prototype.get = function (name)
{
    return this.vectors[name];
};

