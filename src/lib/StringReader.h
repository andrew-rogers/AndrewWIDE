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

#ifndef STRING_READER_H
#define STRING_READER_H

#include <algorithm>
#include <cstring>
#include <string>
#include <vector>

class StringView
{
public:
    StringView( const std::string& str ) : m_ptr(str.c_str()), m_size(str.size())
    {
    }

    StringView( const char* ptr, size_t size ) : m_ptr(ptr), m_size(size)
    {
    }

    const char& operator[](size_t i) const
    {
        return m_ptr[i];
    }

    int compare( const StringView& sv ) const
    {
        size_t n = m_size;
        if( n > sv.m_size ) n = sv.m_size;
        int ret = std::strncmp( m_ptr, sv.m_ptr, n );
        if (ret == 0)
        {
            if( m_size > sv.m_size ) return m_ptr[sv.m_size];
            if( m_size < sv.m_size ) return sv.m_ptr[m_size];
        }
        return ret;
    }

    size_t find( char ch, size_t pos=0 ) const
    {
        const char* f = std::find(m_ptr + pos, m_ptr + m_size, ch);
        if (f == (m_ptr + m_size)) return std::string::npos;
        return f - m_ptr;
    }

    size_t size()
    {
        return m_size;
    }

    std::string str()
    {
        return std::string(m_ptr, m_size);
    }

    StringView substr( size_t pos, size_t count=std::string::npos )
    {
        auto ret = StringView(m_ptr, m_size);
        if (pos > m_size) pos=m_size;
        ret.m_ptr += pos;
        if ((pos + count) > m_size) ret.m_size = m_size - pos;
        else ret.m_size = count;
        return ret;
    }

private:
    const char* m_ptr;
    size_t m_size;
};

class StringReader
{
public:
    StringReader( StringView str, char delim=',' );
    bool good() const
    {
        return m_good;
    }
    StringView read();
    std::vector<StringView> readAll();

private:
    char m_delim;
    bool m_good;
    StringView m_input;
    size_t m_pos;
};

#endif // STRING_READER_H

