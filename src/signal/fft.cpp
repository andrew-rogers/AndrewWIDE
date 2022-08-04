/*
 * AndrewWIDE - FFT operations on vectors.
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

#include "fft.h"
#include "kiss_fft.h"
#include "PlotGenerator.h"
#include "vecmath.h"

cvec_t fft( const cvec_t& in)
{
    size_t N = in.size();
    cvec_t out(N);
    const kiss_fft_cpx* cin = (kiss_fft_cpx*)(&in[0]);
    kiss_fft_cpx* cout = (kiss_fft_cpx*)(&out[0]);
    kiss_fft_cfg cfg = kiss_fft_alloc( N, 0, NULL, NULL );
    kiss_fft( cfg, cin, cout );
    return out;
}

void specgram( const WasmVector<double>& x, size_t N)
{
    size_t S = x.size();
    auto y=zeros(S);
    for (size_t s=0; s<S; s+=N)
    {
        cvec_t in(N);
        for (size_t i=0; i<N; i++) in[i].real(x[s+i]);
        auto out = fft(in);
        for (size_t i=0; i<N; i++) y[s+i]=abs(out[i]);
    }
    heatmap(y,N,S/N);
}

