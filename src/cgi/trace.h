/*
    AndrewWIDE - Trace
    Copyright (C) 2019  Andrew Rogers

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

#ifndef TRACE_H
#define TRACE_H

#define NUM_ARGS(...) NUM_ARGS_M1(__VA_ARGS__, 5, 4, 3, 2, 1, 0)
#define NUM_ARGS_M1(a1, a2, a3, a4, a5, N, ...) N


#define TRACE_1(var) aw_trace(__func__,#var,(var))
//#define TRACE_2(key, var) aw_trace(key,__func__,#var,(var))

#define trace(...) TRACE_M1(NUM_ARGS(__VA_ARGS__), __VA_ARGS__)
#define TRACE_M1(n, ...) TRACE_M2(n, __VA_ARGS__)
#define TRACE_M2(n, ...) TRACE_##n(__VA_ARGS__)

void aw_trace(const std::string& fname, const std::string& name, double val);

#include "trace.cpp"

#endif //TRACE_H

