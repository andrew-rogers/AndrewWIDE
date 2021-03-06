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

#ifndef FILTER_H
#define FILTER_H

#include "awvector.h"

template <typename T>
AwVector<T> conv(const AwVector<T>& x, const AwVector<T>& h);

template <typename T>
AwVector<T> fir(const AwVector<T>& x, const AwVector<T>& coeffs);

template <typename T>
AwVector<T> iir(const AwVector<T>& x, const AwVector<T>& b, const AwVector<T>& a);

#endif // FILTER_H

