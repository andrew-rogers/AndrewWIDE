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

EM_JS( void, console_log, (const char* str), {
    console.log(UTF8ToString(str))
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


const Buffer& getInput( const std::string input_name )
{
    return globals.inputs.byName( input_name );
}

NamedValues getParameters( const std::string input_name )
{
    const Buffer& buf = globals.inputs.byName( input_name );
    return NamedValues( buf );
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
