/*
    AndrewWIDE - Link AwDoc and trace files.
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

#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

void processAwDoc(const string& filename);
void processSection(const string& json, const string& body);
void processObj(Json& obj);
Json readDataFile(const string& fn);

int main (int argc, char *args[])
{
    if (argc > 1)
    {
        processAwDoc(args[1]);
    }
    else
    {
        cerr<<"Input file not specfied."<<endl;
    }

    return 0;
}

void processAwDoc(const string& filename)
{
    ifstream ifs(filename);
    string line;
    string body;
    string json_str;
    size_t cnt(0);
    while (getline(ifs, line))
    {
        if (line.size()>=4 && line.compare(0,3,"AW{")==0 && line.back()=='}')
        {
            // Process previous section
            if (cnt>0) processSection( json_str, body );
            json_str=line.substr(2);
            body="";
            cnt++;
        }
        else
        {
            body+=line+"\n";
        }
    }
    ifs.close();
    
    // Process remaining content
    if (cnt>0) processSection( json_str, body );
    else processSection( "{\"type\":\"json\"}", body ); // The doc may have just JSON.
    
    // Save the g_response JSON to file.
    string fn_out(filesystem::stripExtension(filename));
    fn_out += ".html";
    AwJson::save(fn_out);
}

void processSection(const string& json, const string& body)
{
    // Parse the JSON section
    Json obj;
    istringstream iss(json);
    iss >> obj;
    obj["content"]=body;
    processObj(obj);
}

void processObj(Json& obj)
{
    string type = obj["type"].str();
    if (type.compare("plot")==0)
    {
        string fn = obj["file"].str();
        if (fn.size()>0)
        {
            Json data = readDataFile(fn);
            obj["data"]=data;
        }
    }
    g_response.push_back(obj);
}

Json readDataFile(const string& fn)
{
    Json data;
    ifstream ifs(fn);
    size_t i=0;
    while (!ifs.eof())
    {
        double val;
        ifs >> val;
        data[i] = val;
        i++;
    }
    
    return data;
}

