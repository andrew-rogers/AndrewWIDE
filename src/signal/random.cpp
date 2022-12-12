/*
 * AndrewWIDE - C++ implementation of George Marsaglia's Xorshift RNGs.
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
 
#include "random.h"
#include "vecmath.h"

#include <cmath>

/* https://www.jstatsoft.org/index.php/jss/article/view/v008i14/916
Xorshift RNGs - George Marsaglia 

unsigned long xor(){
static unsigned long y=2463534242;
yˆ=(y<<13); y=(y>>17); return (yˆ=(y<<5)); }

unsigned long long xor64(){
static unsigned long long x=88172645463325252LL;
xˆ=(x<<13); xˆ=(x>>7); return (xˆ=(x<<17)); */

/* Note: it is assumed there is a typo in the xor() function above. Hence the 
implemented function is thus
  y^=(y<<13); y^=(y>>17); y^=(y<<5);
*/

const double Random32::Scale = 0.25/(1UL << 30);

Random32::Random32(uint32_t seed) : m_seed(seed)
{
    if( seed == 0U ) m_seed = 2463534242U;
}

WasmVector<double> Random32::normal(size_t N)
{
    auto ret = zeros(N);
    const size_t N2 = N/2U;
    const double pi2 = M_PI * 2.0;
    for (size_t n=0; n<N2; n++)
    {
        // Box-Muller
        double radius = sqrt(-2.0*log(uniform()));
        double angle  = pi2*uniform();
        ret[n*2]   = radius * cos(angle);
        ret[n*2+1] = radius * sin(angle);
    }
    if (N%2)
    {
        double radius = sqrt(-2.0*log(uniform()));
        double angle  = pi2*uniform();
        ret[N-1]   = radius * cos(angle);
    }
    return ret;
}

double Random32::uniform()
{
    uint32_t y = m_seed;
    y^=(y<<13);
    y^=(y>>17);
    y^=(y<<5);
    m_seed = y;

    return y * Scale;
}

WasmVector<double> Random32::uniform(size_t N)
{
    auto ret = zeros(N);
    for( size_t n=0; n<N; n++ ) ret[n] = uniform();
    return ret;
}

