/*
    AndrewWIDE - Graph plotting
    Copyright (C) 2018  Andrew Rogers

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

#ifndef PLOT_H
#define PLOT_H

#include "awvector.h"
#include "../aw_json/json.h"

#include <string>

extern Json g_response;
extern int g_plot_index;

Json& plot_getJson();

template <typename T>
void plot(const AwVector<T>& vec)
{
    Json trace;
    trace["y"] = vec.toJsonArray();

    Json graph = plot_getJson();
    graph["data"].push_back(trace);
}

template <typename T>
void plot(const AwVector<T>& vec_x, const AwVector<T>& vec_y)
{
    Json trace;
    trace["x"]=vec_x.toJsonArray();
    trace["y"]=vec_y.toJsonArray();

    Json graph = plot_getJson();
    graph["data"].push_back(trace);
}

void xlabel(const std::string label);
void ylabel(const std::string label);

#endif //PLOT_H

