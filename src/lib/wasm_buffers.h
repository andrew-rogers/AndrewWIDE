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
#include <emscripten.h>

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

class WasmVectorBase
{
public:
    virtual void* buffer( size_t& size ) = 0;
    virtual void* expand( size_t e ) = 0;
protected:
    void* m_ptr; // Pointer to std::vector
};

template <typename T>
class WasmVector : public WasmVectorBase
{
public:
    WasmVector()
    {
        m_ptr = new std::vector<T>;
    }
    virtual void* buffer( size_t& size )
    {
        auto vec = ptr();
        size = vec->size();
        return vec->data();
    }
    std::vector<T>* ptr()
    {
        return static_cast<std::vector<T>*>(m_ptr);
    }
    virtual void* expand( size_t e )
    {
        auto vec = ptr();
        vec->resize(vec->size()+e);
        void* ret = &(*vec)[vec->size()-e];
        return ret;
    }
};

class WasmVectors
{
public:
    enum Type{ STRING, INT8, UINT8, INT16, UINT16, INT32, UINT32, INT64, UINT64, FLOAT32, FLOAT64 };

    WasmVectors( const char* name )
    {
        jsrt_add_wasm_vectors( name, this );
    }

    void add(const char* name, std::vector<uint8_t>& vec)
    {
        add(name, &vec, UINT8);
    }
    std::vector<double>* createFloat64( const char* name )
    {
        auto wv = new WasmVector<double>;
        auto vec = wv->ptr();
        jsrt_set_meta( vec, "type", static_cast<size_t>(FLOAT64) );
        jsrt_set_meta( vec, "wasm_vector_ptr", (size_t)(wv) );
        add(name, wv, FLOAT64);
        return vec;
    }
    std::vector<uint8_t>* createUint8( const char* name )
    {
        auto wv = new WasmVector<uint8_t>;
        auto vec = wv->ptr();
        jsrt_set_meta( vec, "type", static_cast<size_t>(UINT8) );
        jsrt_set_meta( vec, "wasm_vector_ptr", (size_t)(wv) );
        add(name, wv, UINT8);
        return vec;
    }
    static void* expand( void* p, size_t type, size_t e );

    std::vector<uint8_t>* getUint8( const char* name )
    {
        void* vp_wv = jsrt_wasm_vectors_get( this, name );
        auto p_wv = static_cast<WasmVector<uint8_t>*>(vp_wv);
        return p_wv->ptr();
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
    size_t return_values[8];
} extern globals;

extern WasmVectors g_shared_vectors;

const Buffer& getInput( const std::string input_name );
NamedValues getParameters( const std::string input_name );
template <typename T>
void plot(std::vector<T>* vec)
{
    // TODO: Check vector is globally accessible otherwise copy into a shared vector.
    std::string js = "{\"cmd\":\"plot\",\"ptr\":" + std::to_string((size_t)vec) + "}";
    jsrt_add_response_cmd(js.c_str());
}

#endif // WASM_BUFFERS_H

