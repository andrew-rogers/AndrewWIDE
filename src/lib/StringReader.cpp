/*
 * AndrewWIDE - Read substrings from a comma delimited string.
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

#include "StringReader.h"

StringReader::StringReader( StringView str, char delim ) : m_delim(delim), m_good(true), m_input(str), m_pos(0U)
{
}

StringView StringReader::read()
{
    std::size_t found = m_input.find(m_delim, m_pos);
    if (found == std::string::npos) m_good = false;
    std::size_t pos = m_pos;
    m_pos = found+1;
    return m_input.substr(pos, found-pos);
}

std::vector<StringView> StringReader::readAll()
{
    std::vector<StringView> ret;
    while (good())
    {
        ret.push_back(read());
    }
    return ret;
}

