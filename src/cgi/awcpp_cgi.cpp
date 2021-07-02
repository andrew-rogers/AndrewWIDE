/*
    AndrewWIDE - AWCPP operations CGI
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

    if( cmd == "build" )
    {
        auto fn = filesystem::absPath(query["awdoc"].str());
        auto dir = filesystem::stripExtension(fn);
        auto func = query["func"].str();
        auto cpp = query["cpp"].str();
        if( func.compare("globals") == 0 )
        {
            auto err = filesystem::mkdir(dir);
            g_response["err"]=filesystem::writeFile(dir+"/globals.h", cpp);
        }
        else
        {
            auto err = filesystem::mkdir(dir+"/func.d");
        }
    }
    else if( cmd == "run" )
    {
        g_response["run_output"] = "make run"; // @todo Invoke make, for now just respond with make run
    }

}

