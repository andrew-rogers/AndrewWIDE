/*
    AndrewWIDE - Instrumentation with JSON output
    Copyright (C) 2021  Andrew Rogers

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

#include "aw_json.h"
#include "../cgi/filesystem.h"

#include <fstream>

//Json g_response;

void save(const std::string& filename)
{
    std::ofstream out(filesystem::fixPath(filename), std::ios::out | std::ios::binary);
    if( out )
    {
        out << g_response;
        out.close();
    }
}
