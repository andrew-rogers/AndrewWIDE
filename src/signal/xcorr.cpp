/*
 * AndrewWIDE - Cross correlation on vectors.
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

#include "xcorr.h"

WasmVector<double> xcorr( const WasmVector<double>& x, const WasmVector<double>& y)
{
    auto data_x = &(*x.ptr())[0];
    auto data_y = &(*y.ptr())[0];
    auto len_x = x.size();
    auto len_y = y.size();
    WasmVector<double> ret;
    if (len_x==0 || len_y==0)
    {
        return ret;
    }
    size_t len_out = len_x+len_y-1;
    ret.resize(len_out);
    auto data_ret = &(*ret.ptr())[0];

    for (size_t k=0; k<len_out; k++)
    {
        int offset = len_y-1-k;
        double sum = 0.0;
        int i0 = 0;
        if (offset < 0) i0 = -offset;
        int i1 = len_x;
        if ((len_x+offset) > len_y) i1 = len_y - offset;
        for (int i = i0; i < i1; i++)
        {
            sum += data_x[i] * data_y[i + offset];
        }
        data_ret[k] = sum;
    }
    return ret;
}

