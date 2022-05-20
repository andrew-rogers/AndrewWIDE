/*
    AndrewWIDE - Graph plotting
    Copyright (C) 2020  Andrew Rogers

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

#include "plot.h"

using namespace std;

int g_plot_index = -1;

Json& plot_getJson()
{
    // TODO: Can this go in the constructor of a singleton?

    // Check for existing plot in g_response
    if ( (g_plot_index >= 0) && (g_plot_index < g_response.length())
         && (g_response[g_plot_index].contains("type"))
         && (g_response[g_plot_index]["type"].str().compare("plot")==0) )
    {
        return g_response[g_plot_index];
    }

    // Create new plot in g_response
    Json graph;
    graph["type"]="plot";
    g_plot_index = g_response.length();
    g_response.push_back(graph);
    return g_response[g_plot_index];
}

void xlabel(const string label)
{
    Json graph = plot_getJson();
    graph["xlabel"] = label;
}

void ylabel(const string label)
{
    Json graph = plot_getJson();
    graph["ylabel"] = label;
}

