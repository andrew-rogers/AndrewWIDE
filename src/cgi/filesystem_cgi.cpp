/*
    AndrewWIDE - File system operations CGI
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

#include "cgi_post.h"
#include "filesystem.h"

#include <fstream>

using namespace std;

void processQuery( Json& query );

int main(int argc, char *args[])
{
    getQuery();

    // Process the query
    processQuery( g_query );

    sendResponse();

    return 0;
}

void processQuery( Json& query )
{
    string cmd=query["cmd"].str();

    if( cmd == "load" )
    {
        std::string content;
        auto fn=filesystem::absPath(query["fn"].str());
        g_response["err"]=filesystem::readFile(fn, content);
        g_response["content"]=content;
    }
    else if( cmd == "save" )
    {
        auto content=query["content"].str();
        auto fn=filesystem::absPath(query["fn"].str());
        g_response["err"]=filesystem::writeFile(fn, content);
    }
    else if( cmd == "list" )
    {

        // Get the directory path from the query.
        auto dir=filesystem::absPath(query["dir"].str());

        // Create file/dir list
        Json list;
        filesystem::listFiles(dir, list);

        // Add a shortcut to the AndrewWIDE directory.
        Json awd;
        awd["path"]=filesystem::findAWDir();
        awd["flags"]="d";
        list.push_back(awd);

        // Produce the response.
        g_response["dir"]=dir;
        g_response["list"]=list;
    }
}

