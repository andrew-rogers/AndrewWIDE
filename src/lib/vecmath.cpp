/*
 * AndrewWIDE - Mathematical operations on vectors.
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

#include "WasmVectors.h"
#include "vecmath.h"
#include <cmath>

WasmVector<double> linspace( double start, double finish, size_t N )
{
    WasmVector<double> ret;
    auto p_vec = ret.ptr();
    double m = (finish-start) / (N-1);
    double c = start;
    for (size_t x=0; x<N; x++)
    {
        p_vec->push_back( m*x + c );
    }
    return ret;
}

WasmVector<double> sin( WasmVector<double>& theta )
{
    auto pv_theta = theta.ptr();
    WasmVector<double> ret;
    auto p_vec = ret.ptr();
    p_vec->reserve(pv_theta->size());
    for (size_t i=0; i<pv_theta->size(); i++)
    {
        p_vec->push_back( sin((*pv_theta)[i]) );
    }
    return ret;
}

