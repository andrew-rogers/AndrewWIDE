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

Globals globals;
WasmVectors g_output_vectors("output_vectors");
std::vector<ResponseGenerator*> g_response_generators;
WasmVectors g_shared_vectors("shared_vectors");
std::string g_javascript;

// Add a javascript function.
EM_JS( void, emjs_add_js_func, (const char* name, const char* code), {
    // Body defined in runtime.
});

void add_js_func(const char* name, const char* code)
{
    emjs_add_js_func(name, code);
}

// Call a javascript function.
EM_JS( void*, emjs_call_js_func, (const char* name, const void* ptr), {
    // Body defined in runtime.
});

void* call_js_func(const char* name, const void* ptr)
{
    return emjs_call_js_func(name, ptr);
}

// Call a javascript module function.
EM_JS( void*, emjs_call_wasmjs, (const char* mod, const char* func, const void* ptr), {
    // Body defined in runtime.
});

void* call_wasmjs(const char *mod, const char* func, const void* ptr)
{
    return emjs_call_wasmjs(mod, func, ptr);
}

// Log strings to the Javascript console
EM_JS( void, emjs_console_log, (const char* str), {
    console.log(UTF8ToString(str))
});

void console_log(const char* str)
{
    emjs_console_log(str);
}

// Send commands to be run in javascript after wasm function is run. The src
//   argument will be JSON.
EM_JS( void, emjs_add_response_cmd, (const char* src), {
    wasm.addResponseCommand(UTF8ToString(src));
});

void jsrt_add_response_cmd(const char* src)
{
    return emjs_add_response_cmd(src);
}

// Create a new WasmVecotrs in Javscript
EM_JS( void, emjs_add_wasm_vectors, (const char* name, void* ptr), {
    new WasmVectors(UTF8ToString(name), ptr);
});

void jsrt_add_wasm_vectors(const char* name, void* ptr)
{
    emjs_add_wasm_vectors(name, ptr);
}

EM_JS( void, jsrt_get_input, (const char* name, void* ptr), {
    new WasmVectors(UTF8ToString(name), ptr);
});

// Add a key value pair to the meta data.
EM_JS( void, emjs_set_meta, (void* ptr, const char* key, size_t value), {
    wasm.setMeta( ptr, UTF8ToString(key), value );
});

void jsrt_set_meta(void* ptr, const char* key, size_t value)
{
    emjs_set_meta(ptr, key, value);
}

// Add WasmVector pointer to WasmVectors
EM_JS( void, emjs_wasm_vectors_add, (void* p_wvs, const char* name, void* ptr, size_t type), {
    var wvs = WasmVectors.dict["p"+p_wvs]; // Lookup the WasmVectors to add the WasmVector to.
    return wvs.addPtr(UTF8ToString(name), ptr, type);
});

void jsrt_wasm_vectors_add(void* p_wvs, const char* name, void* ptr, size_t type)
{
    emjs_wasm_vectors_add(p_wvs, name, ptr, type);
}

// Get address of WasmVector stored in a WasmVectors by name
EM_JS( void*, emjs_wasm_vectors_get, (void* p_wvs, const char* name), {
    var wvs = WasmVectors.dict["p"+p_wvs];
    return wvs.get(UTF8ToString(name)).ptr;
});

void* jsrt_wasm_vectors_get(void* p_wvs, const char* name)
{
    return emjs_wasm_vectors_get(p_wvs, name);
}

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
    g_response_generators.clear();
}

EMSCRIPTEN_KEEPALIVE
extern "C" void generate_responses()
{
    for (size_t i=0; i<g_response_generators.size(); i++)
    {
        JsonValue* json=g_response_generators[i]->generate();
        jsrt_add_response_cmd(json->toJson().c_str());
    }
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* get_return_values()
{
    return globals.return_values;
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* new_vector( size_t type)
{
    return WasmVectorBase::newWasmVector( type );
}

EMSCRIPTEN_KEEPALIVE
extern "C" void vector_data(void* ptr)
{
    auto p_vec = static_cast<WasmVectorBase*>(ptr);
    size_t size;
    globals.return_values[0] = (size_t)(p_vec->buffer( size ));
    globals.return_values[1] = size;
}

EMSCRIPTEN_KEEPALIVE
extern "C" void* wasm_vector_expand( void* p, size_t t, size_t e )
{
    return WasmVectorBase::expand( p, t, e );
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

const Buffer& InputBufferVector::byName( const std::string key )
{
    static const Buffer null(0,0);

    if (m_names.empty())
    {
        // Extract buffers names from last buffer.
        const Buffer& buf = (*this)[size()-1];
        auto sr = StringReader( StringView( (char*)buf.data(), buf.size() ) );
        while (sr.good())
        {
            StringView n = sr.read();
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

