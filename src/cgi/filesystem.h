/*
    AndrewWIDE - File system operations CGI
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

#ifndef FILESYSTEM_H
#define FILESYSTEM_H

#include "json.h"

#include <string>

namespace filesystem {

extern const char KEY_NAME[];
extern const char KEY_TYPE[];

std::string cwd();
bool isDir( const std::string& path );
int listFiles( const std::string& path, Json& list );
std::string readFile( const std::string& path, std::string& content );
std::string writeFile( const std::string& path, const std::string& content );

}

#endif //FILESYSTEM_H

