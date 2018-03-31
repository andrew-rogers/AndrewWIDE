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

#include "filesystem.h"

#include <dirent.h>
#include <unistd.h>
#include <sys/stat.h>
#include <set>
#include <fstream>

namespace filesystem {

extern const char KEY_NAME[]="path";
extern const char KEY_TYPE[]="flags";

std::string cwd()
{
    char buf[PATH_MAX];
    if( getcwd(buf, PATH_MAX) )
    {
        return buf;
    }
    return "";
}

bool isDir( const std::string& path )
{
    struct stat s;
    if( stat(path.c_str(),&s) == 0 )
    {
        if( s.st_mode & S_IFDIR )
        {
            return true;
        }
    }
    return false;
}

int listFiles( const std::string& path, Json& list )
{
    int cnt(0);

    DIR* dirp=opendir(path.c_str());
    if(dirp==NULL)
    {
        return -1;
    }
    
    struct dirent *dir;
    std::set<std::string> files;
    std::set<std::string> dirs;
    
    // Iterate through directory entries
    while((dir=readdir(dirp)) != NULL)
    {
        switch(dir->d_type)
        {
            case DT_REG:
            {
                // Regular file
                files.insert(dir->d_name);
                break;
            }
            
            case DT_DIR:
            {
                // Directory
                dirs.insert(dir->d_name);
                break;
            }
            
            default:
            {
                // Don't include special files
            }
        }
    }

    for(auto dir_name : dirs)
    {
        if( dir_name != "." )
        {
            list[cnt][KEY_NAME]=dir_name;
            list[cnt++][KEY_TYPE]="d";
        }
    }
    
    for(auto file_name : files)
    {
        list[cnt][KEY_NAME]=file_name;
        list[cnt++][KEY_TYPE]="-";
    }
    
    closedir(dirp);
    return cnt;
}

std::string readFile( const std::string& path, std::string& content )
{
    std::ifstream in(path, std::ios::in | std::ios::binary);
    if( in )
    {
        in.seekg( 0, std::ios::end );
        content.resize( in.tellg() );
        in.seekg( 0, std::ios::beg );
        in.read( &content[0], content.size() );
        in.close();
        return( "" );
    }
    return "Can't read file: "+path;
}

std::string writeFile( const std::string& path, const std::string& content )
{
    std::ofstream out(path, std::ios::out | std::ios::binary);
    if( out )
    {
        out << content;
        out.close();
        return( "" );
    }
    return "Can't write file: "+path;
}

} // namespace filesystem

