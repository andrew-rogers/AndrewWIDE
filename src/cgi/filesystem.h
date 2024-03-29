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

#include "../aw_json/json.h"

#include <string>

namespace filesystem {

extern const char KEY_NAME[];
extern const char KEY_TYPE[];

std::string cwd();
std::string cwd( const std::string& path );
std::string fixPath( const std::string& path );
std::string unixPath( const std::string& path );
bool isDir( const std::string& path );
bool isRelative( const std::string& path );
std::string findAWDir();
std::string absPath( const std::string& path );
std::string basename( const std::string& path );
std::string extension( const std::string& path );
std::string stripExtension( const std::string& path );
int listFiles( const std::string& path, Json& list );
std::string readFile( const std::string& path, std::string& content );
std::string readFile( const std::string& path, std::vector<char>& content );
std::string writeFile( const std::string& path, const std::string& content );
std::string mkdir( const std::string& path );

}

#endif //FILESYSTEM_H

