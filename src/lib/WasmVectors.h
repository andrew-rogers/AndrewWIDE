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

#ifndef WASM_VECTORS_H
#define WASM_VECTORS_H

#include <cstddef>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

extern "C" void jsrt_add_wasm_vectors(const char* name, void* ptr);
extern "C" void jsrt_wasm_vectors_add(void* p_wvs, const char* name, void* ptr, size_t type);
extern "C" void* jsrt_wasm_vectors_get(void* p_wvs, const char* name);

class WasmVectorBase
{
public:
    enum Type{ STRING, INT8, UINT8, INT16, UINT16, INT32, UINT32, INT64, UINT64, FLOAT32, FLOAT64 };

    static void* expand( void* p, size_t type, size_t e );
    static void* newWasmVector( size_t size );
    static Type type(uint8_t) {return UINT8;}
    static Type type(float) {return FLOAT32;}
    static Type type(double) {return FLOAT64;}

    virtual void* buffer( size_t& size ) = 0;
    virtual void* expand( size_t e ) = 0;

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

    const std::vector<T>* ptr() const
    {
        return static_cast<std::vector<T>*>(m_ptr);
    }

    void push_back( const T& value )
    {
        auto vec = ptr();
        vec->push_back( value );
    }

    size_t size()
    {
        return ptr()->size();
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
    std::string add(const WasmVector<T>& vec)
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

    WasmVector<float>& createFloat32( const char* name )
    {
        return create<float>( name );
    }

    WasmVector<double>& createFloat64( const char* name )
    {
        return create<double>( name );
    }

    WasmVector<uint8_t>& createUint8( const char* name )
    {
        return create<uint8_t>( name );
    }

    template <typename T>
    WasmVector<T>& get( const char* name )
    {
        void* vp_wv = jsrt_wasm_vectors_get( this, name );
        auto p_wv = static_cast<WasmVector<T>*>(vp_wv);
        return *p_wv;
    }

    WasmVector<float>& getFloat32( const char* name )
    {
        return get<float>( name );
    }

    WasmVector<double>& getFloat64( const char* name )
    {
        return get<double>( name );
    }

    WasmVector<uint8_t>& getUint8( const char* name )
    {
        return get<uint8_t>( name );
    }

private:
    std::vector<WasmVectorBase*> m_vec_ptrs;
    void _add( const char* name, WasmVectorBase* vec)
    {
        jsrt_wasm_vectors_add( this, name, vec, static_cast<size_t>(vec->type()) );
        m_vec_ptrs.push_back(vec);
    }
};

#endif // WASM_VECTORS_H

