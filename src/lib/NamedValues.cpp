/*
 * AndrewWIDE - Named Values support class.
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

#include "NamedValues.h"
#include "StringReader.h"

NamedValues::NamedValues( const Buffer& buf ) : m_str((char*)buf.data(), buf.size())
{
    // Get lines.
    auto line_reader = StringReader(m_str, '\n');

    // For each line, get the name and values string
    while (line_reader.good())
    {
        auto line = line_reader.read();
        auto name_reader = StringReader(line, ':');
        auto name = name_reader.read();
        auto vals = name_reader.read();
        m_names.push_back(name);
        m_vals.push_back(vals);
    }
}

size_t NamedValues::find( const std::string val_name )
{
    for (size_t i=0; i<m_names.size(); i++)
    {
        if (m_names[i].compare(val_name) == 0) return i;
    }
    return std::string::npos;
}

std::vector<double> NamedValues::getF64( const std::string val_name )
{
    std::vector<double> ret;

    // Lookup name to get values string.
    size_t index = find( val_name );
    if (index>=m_vals.size()) return ret;
    auto val_str = m_vals[index];

    // Convert values string to vector.
    auto value_reader = StringReader(val_str, ',');
    while (value_reader.good())
    {
        double val = stod(value_reader.read().str());
        ret.push_back(val);
    }
    return ret;
}

