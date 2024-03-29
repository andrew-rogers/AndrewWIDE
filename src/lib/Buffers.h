/*
 * AndrewWIDE - Convenience classes for handling memory buffers.
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

#ifndef BUFFERS_H
#define BUFFERS_H

#include <cstddef>
#include <vector>
#include <string>

class Buffer
{
public:
    Buffer( void* ptr, size_t size );
    void* data() const
    {
        return m_ptr;
    }
    size_t size() const
    {
        return m_size;
    }
    std::string str() const
    {
        return std::string((char*)m_ptr, m_size); 
    }
protected:
    void* m_ptr;
    size_t m_size;
};

class AllocBuffer : public Buffer
{
public:
    AllocBuffer( size_t num_bytes );
    ~AllocBuffer();    
};

class BufferVector
{
public:
    BufferVector();
    Buffer& addBuffer( void* ptr, size_t size );
    Buffer& allocBuffer( size_t num_bytes );
    void clear();
    size_t size() const
    {
        return m_buffers.size();
    }
    const Buffer& operator[]( const size_t index ) const;
private:
    std::vector<Buffer*> m_buffers;
};

#endif // BUFFERS_H

