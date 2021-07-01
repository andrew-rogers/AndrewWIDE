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

std::string findAWDir()
{
    std::string cwd=filesystem::cwd();
    std::size_t found = cwd.rfind("/www");
    if( found != std::string::npos ) return cwd.substr(0,found);
    return cwd;
}

void processQuery( Json& query )
{
    string cmd=query["cmd"].str();

    if( cmd == "build" )
    {
        //filesystem::writeFile("globals.h", g_query["cpp"].str());
        //g_response["build_output"] = "make"; // @todo Invoke make, for now just respond with make
        g_response["AWDir"]=findAWDir();
        g_response["BuildDir"]=g_query["dir"].str();
    }
    else if( cmd == "run" )
    {
        g_response["run_output"] = "make run"; // @todo Invoke make, for now just respond with make run
    }

}

