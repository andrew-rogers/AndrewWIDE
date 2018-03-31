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

#include "json.h"
#include "filesystem.h"

#include <iostream>
#include <sstream>

using namespace std;

string findAWDir();
Json processQuery( Json& query );
string validateDir(const string& dir);

int main(int argc, char *args[])
{
    Json query;

    char *length_str=getenv("CONTENT_LENGTH");
	cout<<"Content-type: text/plain"<<endl<<endl;

    if(length_str)
    {
        int length=atoi(length_str);
        int max_length=1024*1024;
        if(length>max_length)
        {
            cout<<"Too much POST, "<<length<<" bytes, maximum is "<<max_length<<"bytes."<<endl;
        }
        else
        {
            // Read all the POST input data
            char post_data[length];
            cin.read(post_data,length);

            // Search for LF after JSON section
            int json_length=0;
            while( json_length<length && post_data[json_length]!='\n' )json_length++;

            // Parse the JSON section
            string str(post_data, json_length);
            istringstream in(str);
            in >> query;

            // Process the query
            Json response = processQuery( query );
            cout << response << endl;
        }
    }
    else
    {
	    cout<<"Not valid POST! - no CONTENT_LENGTH."<<endl;
    }

    return 0;
}

Json processQuery( Json& query )
{
    Json response;

    string cmd=query["cmd"].str();

    if( cmd == "listfiles" )
    {

        // Get the directory path from the query and validate it.
        string dir=validateDir(query["path"].str());

        // Create file/dir list
        Json list;
        filesystem::listFiles(dir, list);

        // Add a shortcut to the AndrewWIDE directory.
        Json awd;
        awd["path"]=findAWDir();
        awd["flags"]="d";
        list.push_back(awd);

        // Produce the response.
        response["dir"]=dir;
        response["list"]=list;
    }
    else if( cmd == "load" )
    {
        string content;
        response["error"] = filesystem::readFile( query["path"].str(), content );
        response["content"]=content;
    }
    else if( cmd == "save" )
    {
        response["error"] = filesystem::writeFile( query["path"].str(), query["content"].str() );
    }

    return response;
}

string findAWDir()
{
    string cwd=filesystem::cwd();
    std::size_t found = cwd.rfind("/html");
    if( found != std::string::npos ) return cwd.substr(0,found);
    return cwd;
}

string validateDir(const string& dir)
{
    string _dir(dir);

    // Cleanup path ending with /..
    if( _dir.size() >= 3 && _dir.substr(_dir.size()-3,_dir.size()) == "/.." )
    {
        std::size_t found = _dir.substr(0,_dir.size()-3).rfind("/");
        if( found != std::string::npos ) _dir=dir.substr(0,found);
    }

    // If dir is not valid then use AndrewWIDE root dir.
    if( filesystem::isDir(_dir) )return _dir;
    return findAWDir();
}

