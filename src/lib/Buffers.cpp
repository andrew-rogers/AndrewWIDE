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

#include "Buffers.h"

Buffer::Buffer( void* ptr, size_t size ) : m_ptr(ptr), m_size(size)
{
}

AllocBuffer::AllocBuffer( size_t num_bytes ) : Buffer( new char[num_bytes], num_bytes)
{
}

AllocBuffer::~AllocBuffer()
{
    char* p = (char*)m_ptr;
    delete[] p;
}

BufferArray::BufferArray()
{
}

Buffer* BufferArray::addBuffer( void* ptr, size_t size )
{
    Buffer* buf = new Buffer(ptr,size);
    m_buffers.push_back(buf);
    return buf;
}

Buffer* BufferArray::allocBuffer( size_t num_bytes )
{
    Buffer* buf = new AllocBuffer( num_bytes );   
    m_buffers.push_back(buf);
    return buf;
}

void BufferArray::clear()
{
    m_buffers.clear();
}

Buffer& BufferArray::operator[]( const size_t index )
{
    return *m_buffers[index];
}

Buffer& BufferArray::operator[]( const std::string key )
{
    // TODO: Last buffer will be a string of buffer names. Extract the names and get named buffer.
    return *m_buffers[0];
}

