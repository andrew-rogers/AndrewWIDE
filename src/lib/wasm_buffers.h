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

class WasmVectorBase
{
public:
    enum Type{ STRING, INT8, UINT8, INT16, UINT16, INT32, UINT32, INT64, UINT64, FLOAT32, FLOAT64 };
    virtual void* buffer( size_t& size ) = 0;
    virtual void* expand( size_t e ) = 0;
    static Type type(uint8_t) {return UINT8;}
    static Type type(double) {return FLOAT64;}
    Type type() const
    {
        return m_type;
    }

protected:
    void* m_ptr; // Pointer to std::vector
    Type m_type;
};

template <typename T>
class WasmVector : public WasmVectorBase
{
public:
    WasmVector() : m_shptr( new std::vector<T> )
    {
        m_ptr = m_shptr.get();
        T dummy;
        m_type = type(dummy);
    }

    virtual void* buffer( size_t& size )
    {
        auto vec = ptr();
        size = vec->size();
        return vec->data();
    }

    virtual void* expand( size_t e )
    {
        auto vec = ptr();
        vec->resize(vec->size()+e);
        void* ret = &(*vec)[vec->size()-e];
        return ret;
    }

    std::vector<T>* ptr()
    {
        return static_cast<std::vector<T>*>(m_ptr);
    }

    void push_back( const T& value )
    {
        auto vec = ptr();
        vec->push_back( value );
    }

    T& operator[]( size_t index)
    {
        auto vec = ptr();
        return (*vec)[index];
    }
private:
    std::shared_ptr<std::vector<T> > m_shptr;
};

class WasmVectors
{
public:
    WasmVectors( const char* name )
    {
        jsrt_add_wasm_vectors( name, this );
    }

    template <typename T>
    std::string add(WasmVector<T>& vec)
    {
        // Copy vec into a new WasmVector as the reference will go out of scope.
        auto wv = new WasmVector<T>;
        std::string name = "wv@"+std::to_string((size_t)wv);
        *wv = vec;
        _add(name.c_str(), wv);
        return name;
    }

    template <typename T>
    void add(const char* name, WasmVector<T>& vec)
    {
        // Copy vec into a new WasmVector as the reference will go out of scope.
        auto wv = new WasmVector<T>;
        *wv = vec;
        _add(name, wv);
    }

    template <typename T>
    WasmVector<T>& create( const char* name )
    {
        auto wv = new WasmVector<T>;
        _add(name, wv);
        return *wv;
    }

    WasmVector<double>& createFloat64( const char* name )
    {
        return create<double>( name );
    }

    WasmVector<uint8_t>& createUint8( const char* name )
    {
        return create<uint8_t>( name );
    }

    static void* expand( void* p, size_t type, size_t e );

    WasmVector<uint8_t>& getUint8( const char* name )
    {
        void* vp_wv = jsrt_wasm_vectors_get( this, name );
        auto p_wv = static_cast<WasmVector<uint8_t>*>(vp_wv);
        return *p_wv;
    }

private:
    std::vector<WasmVectorBase*> m_vec_ptrs;
    void _add( const char* name, WasmVectorBase* vec)
    {
        jsrt_wasm_vectors_add( this, name, vec, static_cast<size_t>(vec->type()) );
        m_vec_ptrs.push_back(vec);
    }
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

