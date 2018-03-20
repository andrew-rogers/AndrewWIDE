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

#include <iostream>
#include <sstream>

using namespace std;

int main(int argc, char *args[])
{
    Json json;

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
            in >> json;
        }
    }
    else
    {
	    cout<<"Not valid POST! - no CONTENT_LENGTH."<<endl;
    }

    cout<<json<<endl;
 
	return 0;
}

