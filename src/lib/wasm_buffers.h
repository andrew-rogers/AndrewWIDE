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

struct Globals
{
    InputBufferVector inputs;
    OutputBufferVector outputs;
} extern globals;

const Buffer& getInput( const std::string input_name );
NamedValues getParameters( const std::string input_name );
void setOutput( const std::string output_name, const std::vector<double> vec );

#endif // WASM_BUFFERS_H

