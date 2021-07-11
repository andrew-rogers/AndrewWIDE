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

#include "../aw_json/json.h"
#include "trace.h"

#include <map>
#include <sstream>

extern Json g_response;

std::map< std::string, Json> g_aw_traces;

void aw_trace(const std::string& file, int line, const std::string& fname, const std::string& vname, double val)
{
    Json j_v;
    j_v = val;

    std::ostringstream oss;
    oss << file << ":" << line << ":" << fname << ":" << vname;
    std::string key = oss.str();

    if (g_aw_traces.find(key) == g_aw_traces.end())
    {
        // Not found so create
        Json j_trace;
        j_trace["type"] = "trace";
        j_trace["file"] = file;
        j_trace["line"] = line;
        j_trace["fname"] = fname;
        j_trace["vname"] = vname;
        g_aw_traces[key] = j_trace;
        g_response.push_back(j_trace);
    }

    Json& j_trace = g_aw_traces[key];
    j_trace["trace"].push_back(j_v);
}

