/*
    AndrewWIDE - DSP Filters
    Copyright (C) 2020 Andrew Rogers

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

#include "filter.h"

template <typename T>
AwVector<T> conv(const AwVector<T>& x, const AwVector<T>& h)
{
    AwVector<T> ret;
    ret.reserve(x.size() + h.size() - 1);
    for( int n=0; n<(x.size() + h.size() -1); n++ ) ret.push_back(0);
    for( int n=0; n<x.size(); n++ )
    {
        for( int k=0; k<h.size(); k++ )
        {
            ret[n+k]+=x[n]*h[k];
        }
    }
    return ret;
}

template <typename T>
AwVector<T> fir(const AwVector<T>& x, const AwVector<T>& coeffs)
{
    AwVector<T> ret;
    ret.reserve(x.size());
    for( int n=0; n<x.size(); n++ )
    {
        T sum=x[n]*coeffs[0];
        for( int k=1; k<coeffs.size() && k<n; k++ )
        {
            sum+=x[n-k]*coeffs[k];
        }
        ret.push_back(sum);
    }
    return ret;
}

// Compile instantiations of template functions for double
template AwVector<double> conv(const AwVector<double>&, const AwVector<double>&);
template AwVector<double> fir(const AwVector<double>&, const AwVector<double>&);

