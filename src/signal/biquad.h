/*
 * AndrewWIDE - Biquadratic IIR filter.
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

#ifndef BIQUAD_H
#define BIQUAD_H

#include "WasmVectors.h"

WasmVector<double> xcorr( const WasmVector<double>& x, const WasmVector<double>& y);

class Biquad
{
public:
    Biquad(double b0, double b1, double b2, double a1, double a2) : m_b0(b0), m_b1(b1), m_b2(b2), m_a1(a1), m_a2(a2)
    {
    }
    
    void processBlock( const double* x, double* y, size_t N );
    WasmVector<double> processBlock( const WasmVector<double>& x )
    {
        WasmVector<double> y(x.size());
        processBlock(&x[0], &y[0], x.size());
        return y;
    }
private:
    double m_b0;
    double m_b1;
    double m_b2;
    double m_a1;
    double m_a2;
    double m_x1;
    double m_x2;
    double m_y1;
    double m_y2;
};

#endif // BIQUAD_H

