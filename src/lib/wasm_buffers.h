/*
 * AndrewWIDE - Buffer handling for interfacing C++ sections into JavaScript.
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

#ifndef WASM_BUFFERS_H
#define WASM_BUFFERS_H

#include "Buffers.h"
#include "NamedValues.h"
#include "WasmVectors.h"
#include "vecmath.h"
#include <emscripten.h>
#include <memory>

extern "C" void console_log(const char* str);
extern "C" void jsrt_add_response_cmd(const char* src);
extern "C" void jsrt_add_wasm_vectors(const char* name, void* ptr);
extern "C" void jsrt_set_meta(void* ptr, const char* key, size_t value);
extern "C" void jsrt_wasm_vectors_add(void* p_wvs, const char* name, void* ptr, size_t type);
extern "C" void* jsrt_wasm_vectors_get(void* p_wvs, const char* name);

class InputBufferVector : public BufferVector
{
public:
    const Buffer& byName( const std::string name );
    void clear();
private:
    std::vector<StringView> m_names;
};



struct Globals
{
    InputBufferVector inputs;
    size_t return_values[8];
} extern globals;

extern WasmVectors g_output_vectors;
extern WasmVectors g_shared_vectors;

const Buffer& getInput( const std::string input_name );
NamedValues getParameters( const std::string input_name );

template <typename T>
void plot(WasmVector<T>& y)
{
    std::string name = g_output_vectors.add(y);
    std::string js = "{\"cmd\":\"plot\",\"vec_name\":\"" + name + "\"}";
    jsrt_add_response_cmd(js.c_str());
}

#endif // WASM_BUFFERS_H

