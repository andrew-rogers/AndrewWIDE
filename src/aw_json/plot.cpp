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

void xlabel(const string label)
{
    Json graph = g_response[g_response.length()-1];
    graph["xlabel"] = label;
}

void ylabel(const string label)
{
    Json graph = g_response[g_response.length()-1];
    graph["ylabel"] = label;
}

