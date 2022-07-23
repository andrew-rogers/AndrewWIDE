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

#include "wasm_buffers.h"
#include "StringReader.h"
#include <emscripten.h>

Globals globals;
WasmVectors g_shared_vectors("shared_vectors");
std::string g_javascript;

EM_JS( void, console_log, (const char* str), {
    console.log(UTF8ToString(str))
});

EM_JS( void, jsrt_add_response_cmd, (const char* src), {
    wasm.addResponseCommand(UTF8ToString(src));
});

EM_JS( void, jsrt_add_wasm_vectors, (const char* name, void* ptr), {
    new WasmVectors(UTF8ToString(name), ptr);
});

EM_JS( void, jsrt_set_meta, (void* ptr, const char* key, size_t value), {
    wasm.setMeta( ptr, UTF8ToString(key), value );
});

EM_JS( void, jsrt_wasm_vectors_add, (void* p_wvs, const char* name, void* ptr, size_t type), {
    var wvs = WasmVectors.dict["p"+p_wvs];
    return wvs.addPtr(UTF8ToString(name), ptr, type);
});

EM_JS( void*, jsrt_wasm_vectors_get, (void* p_wvs, const char* name), {
    var wvs = WasmVectors.dict["p"+p_wvs];
    return wvs.get(UTF8ToString(name)).ptr;
});

void console_log(size_t n)
{
    console_log(std::to_string(n).c_str());
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* add_input( void* ptr, size_t num_bytes )
{
    Buffer& buf = globals.inputs.addBuffer( ptr, num_bytes );
    return buf.data();
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* alloc_input( size_t num_bytes )
{
    Buffer& buf = globals.inputs.allocBuffer( num_bytes );
    return buf.data();
}

EMSCRIPTEN_KEEPALIVE
extern "C" void clear_buffers()
{
    globals.inputs.clear();
    globals.outputs.clear();
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* get_output( size_t index, size_t* size )
{
    void* ptr = 0;
    if (index < globals.outputs.size())
    {
        const Buffer& b=globals.outputs[index];
        ptr = b.data();
        *size = b.size();
    }
    else if (index == globals.outputs.size())
    {
        // Return the names.
        std::string& names = globals.outputs.getNames();
        ptr = &names[0];
        *size = names.size();
    }
    else
    {
        // If index out of range, set pointer to 0 and size to number of outputs available.
        *size = globals.outputs.size();
    }
    return ptr;
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* get_return_values()
{
    return globals.return_values;
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* new_vector_uint8()
{
    return new std::vector<uint8_t>;
}

EMSCRIPTEN_KEEPALIVE
extern "C" void vector_uint8_data(void* ptr)
{
    auto vec = static_cast<std::vector<uint8_t>*>(ptr);
    globals.return_values[0] = (size_t)(vec->data());
    globals.return_values[1] = vec->size();
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* wasm_vector_expand( void* p, size_t t, size_t e )
{
    return WasmVectors::expand( p, t, e );
}

const Buffer& getInput( const std::string input_name )
{
    return globals.inputs.byName( input_name );
}

NamedValues getParameters( const std::string input_name )
{
    const Buffer& buf = globals.inputs.byName( input_name );
    return NamedValues( buf );
}

void plot(std::vector<uint8_t>* vec)
{
    // TODO: Check vector is globally accessible otherwise copy into a shared vector.
    std::string js = "{\"cmd\":\"plot\",\"ptr\":" + std::to_string((size_t)vec) + "}";
    jsrt_add_response_cmd(js.c_str());
}

void setOutput( const std::string output_name, const std::vector<double> vec )
{
    globals.outputs.addBuffer( output_name, (void*)&vec[0], vec.size() * sizeof(double) );
}

const Buffer& InputBufferVector::byName( const std::string key )
{
    static const Buffer null(0,0);

    if (m_names.empty())
    {
        // Extract buffers names from last buffer.
        const Buffer& buf = (*this)[size()-1];
        auto sr = StringReader( std::string_view( (char*)buf.data() ) );
        while (sr.good())
        {
            std::string_view n = sr.read();
            m_names.push_back(n);
        }
    }
    for (size_t i=0; i<m_names.size(); i++)
    {
        if (m_names[i].compare(key) == 0)
        {
            return (*this)[i];
        }
    }
    return null;
}

void InputBufferVector::clear()
{
    BufferVector::clear();
    m_names.clear();
}

Buffer& OutputBufferVector::addBuffer( const std::string name, void* ptr, size_t size )
{
    if (m_names.size()>0) m_names += ", ";
    m_names += name;
    return BufferVector::addBuffer( ptr, size );
}

void OutputBufferVector::clear()
{
    BufferVector::clear();
    m_names = "";
}

void* WasmVectors::expand( void* p, size_t type, size_t e )
{
    auto t = static_cast<Type>(type);
    void* ret = NULL;
    switch (t)
    {
        case CHAR:
        {
            auto vec = static_cast<std::vector<char>*>(p);
            vec->resize(vec->size()+e);
            ret = &(*vec)[vec->size()-e];
            break;
        }
        case UINT8:
        {
            auto vec = static_cast<std::vector<uint8_t>*>(p);
            vec->resize(vec->size()+e);
            ret = &(*vec)[vec->size()-e];
            break;
        }
        default:
        {
            ret = NULL;
        }
    }
    return ret;
}

