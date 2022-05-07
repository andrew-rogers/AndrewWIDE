/*
    AndrewWIDE - Math utilities
    Copyright (C) 2020,2021 Andrew Rogers

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

#include "awmath.h"
#include <cmath>

AwVector<double> linspace(double start, double end, int length)
{
    AwVector<double> ret;
    double inc=(end-start)/(length-1);
    for( int i=0; i<length; i++ )
    {
        ret.push_back(start+i*inc);
    }
    return ret;
}

AwVector<double> sin(const AwVector<double>& angle)
{
    AwVector<double> ret;
    for( int i=0; i<angle.size(); i++)
    {
        ret.push_back(sin(angle[i]));
    }
    return ret;
}

AwVector<double> operator*(double a, const AwVector<double>& vec)
{
    AwVector<double> ret;
    for( int i=0; i<vec.size(); i++)
    {
        ret.push_back(a*vec[i]);
    }
    return ret;
}

AwVector<double> operator+(const AwVector<double>& vec, double a)
{
    AwVector<double> ret(vec.size());
    for( int i=0; i<vec.size(); i++)
    {
        ret[i] = vec[i]+a;
    }
    return ret;
}

