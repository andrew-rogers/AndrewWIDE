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
    char* str = getcwd(NULL, 0);
    if( str!=NULL )
    {
        std::string ret(str);
        free(str);
        return unixPath(ret);
    }
    return "";
}

std::string cwd( const std::string& path )
{
    if( chdir( fixPath(path).c_str() ) == 0 )
    {
        return "";
    }
    return "Can't change to directory: "+path;
}

std::string fixPath( const std::string& path )
{
#ifdef WINDOWS
    std::string ret(path);
    for( size_t i=0; i<ret.size(); i++ )
    {
        if( ret[i]=='/' ) ret[i]='\\';
    }
    return ret;
#else
    return path;
#endif
}

std::string unixPath( const std::string& path )
{
#ifdef WINDOWS
    std::string ret(path);
    for( size_t i=0; i<ret.size(); i++ )
    {
        if( ret[i]=='\\' ) ret[i]='/';
    }
    return ret;
#else
    return path;
#endif
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

bool isRelative( const std::string& path )
{
#ifdef WINDOWS
    if( path[1]==':' ) return false;
#endif
    if( path[0]=='/' ) return false;
    return true;
}

std::string findAWDir()
{
    std::string str_cwd=cwd();
    std::size_t found = str_cwd.rfind("/www");
    if( found != std::string::npos ) return str_cwd.substr(0,found);
    return str_cwd;
}

std::string absPath( const std::string& path )
{
    std::string ret(path);
    if( filesystem::isRelative(ret) )
    {
        ret=filesystem::findAWDir()+'/'+ret;
    }
    return ret;
}

std::string basename( const std::string& path )
{
    std::size_t found = path.rfind("/");
    if( found != std::string::npos ) return path.substr(found+1);
    return path;
}

std::string stripExtension( const std::string& path )
{
    std::size_t found = path.rfind(".");
    if( found != std::string::npos ) return path.substr(0,found);
    return path;
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
    std::ifstream in(fixPath(path), std::ios::in | std::ios::binary);
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
    std::ofstream out(fixPath(path), std::ios::out | std::ios::binary);
    if( out )
    {
        out << content;
        out.close();
        return( "" );
    }
    return "Can't write file: "+path;
}

std::string mkdir( const std::string& path )
{
#ifdef WINDOWS
    int ret = _mkdir(fixPath(path).c_str());
#else
    int ret = ::mkdir(path.c_str(), 0700);
#endif
    if( ret==0 )return "";
    return "Can't create directory: "+path;
}

} // namespace filesystem

