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

extern "C" void console_log(const char* str);
extern "C" void jsrt_add_wasm_vectors(const char* name, void* ptr);
extern "C" void jsrt_wasm_vectors_add(void* p_wvs, const char* name, void* ptr, size_t type);
extern "C" void* jsrt_wasm_vectors_get(void* p_wvs, const char* name);

class InputBufferVector : public BufferVector
{
public:
    const Buffer& byName( const std::string name );
    void clear();
private:
    std::vector<std::string_view> m_names;
};

class OutputBufferVector : public BufferVector
{
public:
    Buffer& addBuffer( const std::string name, void* ptr, size_t size );
    void clear();
    std::string& getNames()
    {
        return m_names;
    }
private:
    std::string m_names;
};

class WasmVectors
{
public:
    enum Type{ CHAR, INT8, UINT8 };

    WasmVectors( const char* name )
    {
        jsrt_add_wasm_vectors( name, this );
    }

    void add(const char* name, std::vector<uint8_t>& vec)
    {
        add(name, &vec, UINT8);
    }
    std::vector<uint8_t>* createUint8( const char* name )
    {
        auto vec = new std::vector<uint8_t>;
        add(name, vec, UINT8);
        return vec;
    }
    static void* expand( void* p, size_t type, size_t e );

    std::vector<uint8_t>* getUint8( const char* name )
    {
        void* ptr = jsrt_wasm_vectors_get( this, name );
        return static_cast<std::vector<uint8_t>*>(ptr);
    }
private:
    void add( const char* name, void* vec, Type t )
    {
        jsrt_wasm_vectors_add( this, name, vec, static_cast<size_t>(t) );
    }
};


struct Globals
{
    InputBufferVector inputs;
    OutputBufferVector outputs;
    size_t return_values[8];
} extern globals;

extern WasmVectors g_shared_vectors;

const Buffer& getInput( const std::string input_name );
NamedValues getParameters( const std::string input_name );
void setOutput( const std::string output_name, const std::vector<double> vec );

#endif // WASM_BUFFERS_H

