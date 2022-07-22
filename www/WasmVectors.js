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

var WasmVectorUint8 = function(ptr) {
    this.ptr = ptr | 0; // Address of the std::vector
    if (this.ptr == 0) {
        this.ptr = wasm.cfunc("new_vector_uint8")();
    }
};

WasmVectorUint8.prototype.list = function() {
    wasm.cfunc("vector_uint8_data")(this.ptr);
    var rv = wasm.getReturnValues();
    console.log(rv);
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
    this.return_values = wasm.getReturnValues();
};

WasmVectors.dict = {};

WasmVectors.prototype.createUint8 = function ()
{
    var vec = new WasmVectorUint8();
    wasm.cfunc("wasm_vectors_add_uint8")(this.ptr, vec.ptr);
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

    if (vec) this.vectors[name] = vec;
    return vec;
};

WasmVectors.prototype.get = function (name)
{
    return this.vectors[name];
};

