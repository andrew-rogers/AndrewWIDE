/*
    AndrewWIDE - Math utilities
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

#ifndef AWMATH_H
#define AWMATH_H

#include "awvector.h"

static const double PI=3.141592653589793F;

AwVector<double> linspace(double start, double end, int length);
AwVector<double> sin(const AwVector<double>& angle);
AwVector<double> operator*(double a, const AwVector<double>& vec);

#endif // AWMATH_H

