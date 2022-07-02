/*
 * AndrewWIDE - Heapless memory allocation for arrays.
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

#include <cstddef>
#include <initializer_list>

// Adapted from https://www.linkedin.com/pulse/cpp-containers-embedded-systems-uhmm-ernesto-cruz-olivera

template <typename Type>
class Array
{
public:
    Array(Type* array, size_t size) : m_array(array), m_size(size)
    {
    }

    Array(Type* array, size_t size, std::initializer_list<Type> l) : m_array(array), m_size(size)
    {
        size_t i=0U;
        for (auto it = l.begin(); it != l.end(); it++) m_array[i++] = *it;
    }

    inline Type& operator[](size_t index) const
    {
        return m_array[index];
    }

    inline size_t size() const
    {
        return m_size;
    }
private:
    Type* m_array;
    size_t m_size;
};

template <class Type, size_t Size>
class ArrayAlloc : public Array<Type>
{
public:
    ArrayAlloc() : Array<Type>(m_array, Size)
    {
    }

    ArrayAlloc(std::initializer_list<Type> l) : Array<Type>(m_array, Size, l)
    {
    }
private:
    Type m_array[Size];
};

