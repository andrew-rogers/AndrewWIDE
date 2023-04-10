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
#include <dlfcn.h>

using namespace std;

void processQuery( Json& query );
int build();
std::string cppFunc( const std::string& dir, const std::string& func, const std::string& cpp );
std::string cppFuncHdr( const std::string& dir, const std::string& func );
void buildWasm();
void getTypes();
int make( const std::string& makefile, const std::string& cgi );
int emmake( const std::string& awdir );
string base64Encode(vector<char>& data);

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
    string type = query["type"].str();

    if( type == "get_types" )
    {
        getTypes();
    }
    else if( type == "func_src" )
    {
        auto dir = filesystem::absPath(query["module"].str());
        dir += ".awtmp";
        auto func = query["func"].str();
        auto cpp = query["src"].str();
        if( func.compare("globals") == 0 )
        {
            auto err = filesystem::mkdir(dir); /// @todo Check for errors
            g_response["err"]=filesystem::writeFile(dir+"/globals.h", cpp);
        }
        else if( func.compare("global_defs") == 0 )
        {
            auto err = filesystem::mkdir(dir); /// @todo Check for errors
            auto out = cppFunc( dir, "", cpp );
            g_response["err"]=filesystem::writeFile(dir+"/globals.cpp", out);
        }
        else if( func.compare("mk") == 0 )
        {
            auto err = filesystem::mkdir(dir); /// @todo Check for errors
            g_response["err"]=filesystem::writeFile(dir+"/includes.mk", cpp);
        }
        else
        {
            auto err = filesystem::mkdir(dir); /// @todo Check for errors

            // Create the C++ function files
            auto out = cppFunc(dir, func, cpp);
            err = filesystem::mkdir(dir+"/func.d"); /// @todo Check for errors
            err += filesystem::writeFile(dir+"/func.d/"+func+"_aw.cpp", out);
            out = cppFuncHdr(dir, func);
            err += filesystem::writeFile(dir+"/func.d/"+func+"_aw.h", out);

            g_response["type"]="func";
            g_response["func"]=func;
        }
        g_response["module"] = query["module"].str();
    }
    else if( type == "func" )
    {
        auto dir = filesystem::absPath(g_query["module"].str());
        auto cgi = filesystem::basename(dir);
        dir += ".awtmp";

        int error_code=build();

        if (error_code!=0)
        {
            g_response["type"] = "mono";
            return;
        }

        auto content = g_response["content"].str();
        string err;
        auto so_file = dir+"/"+cgi+".so";
        auto func = query["func"].str();
        void* dlh = dlopen(so_file.c_str(), RTLD_LAZY);
        if( dlh != NULL )
        {
            // Setup the function arguments
            Json* func_query = (Json*)dlsym(dlh, "g_query");
            if( func_query != NULL ) (*func_query)["args"] = query["args"];
            else err += "Can't access query JSON.\n";

            // Locate and call the function
            void (*func_call)(void) = (void (*)(void))dlsym(dlh, func.c_str());
            if( func_call != NULL ) func_call();
            else err += "Can't locate function: "+func+"\n";

            // Get the function response
            Json* func_resp = (Json*)dlsym(dlh, "g_response");
            if( func_resp != NULL ) g_response["array"]=*func_resp;
            else err += "Can't access response JSON.\n";

            dlclose(dlh);
        }
        else
        {
            err = "Can't load module: "+so_file;
        }

        if (err.size() > 0)
        {
            // Append err to content.
            g_response["content"] = content + "\n" + err;
            g_response["type"] = "mono";
        }
        else
        {
            g_response["type"] = "array";
        }
    }
    else if( type == "awcppwasm_src" )
    {
        buildWasm();
    }
    else
    {
        g_response["type"] = "mono";
        g_response["content"] = "Type '"+type+"' not supported by backend.";
    }
}

int build()
{
    auto dir = filesystem::absPath(g_query["module"].str());
    auto cgi = filesystem::basename(dir);
    dir += ".awtmp";
    string err;

    // Change directory and invoke make
    auto awdir = filesystem::findAWDir();
    err += filesystem::cwd(dir);

    int exit_code=-1;
    string build_log;
    if (err.size()==0)
    {
        exit_code = make(awdir, cgi);

        // Get the build log
        err = filesystem::readFile("build.log", build_log);
    }

    // Append err and build log to content.
    g_response["content"] = g_response["content"].str() + err + build_log;

    return exit_code;
}

std::string cppFunc( const std::string& dir, const std::string& func, const std::string& cpp )
{
    std::string out;

    out += "// This file is automatically generated by AndrewWIDE, changes may be lost.\n";
    out += "\n";
    out += "#include \"plot.h\"\n";
    out += "#include \"trace.h\"\n";
    out += "#include \"math.h\"\n";
    out += "#include \"awmath.h\"\n";
    out += "\n";

    std::string global;
    filesystem::readFile(dir+"/globals.h", global); // String empty if file not found.
    if( global.size() > 0 )
    {
        out += "// Include globals.\n";
        if( func.size() > 0) out += "#include \"../globals.h\"\n";
        else out += "#include \"globals.h\"\n"; // Page global code.
    }
    out += "\n";
    if( func.size() > 0)
    {
        out += "extern \"C\" void "+func+"()\n";
        out += "{\n";
        out += cpp;
        out += "}\n";
    }
    else
    {
        // Page global code.
        out += cpp;
    }
    return out;
}

std::string cppFuncHdr( const std::string& dir, const std::string& func )
{
    std::string out;

    out += "// This file is automatically generated by AndrewWIDE, changes may be lost.\n";
    out += "\n";
    auto guard = func+"_H";
    out += "#ifndef "+guard+"\n";
    out += "#define "+guard+"\n";
    out += "\n";
    out += "extern \"C\" void "+func+"();\n";
    out += "\n";
    out += "#endif //"+guard+"\n";

    return out;
}

void buildWasm()
{
    auto dir = filesystem::absPath(g_query["module"].str());
    auto cpp = g_query["src"].str();
    string err;

    // Create a temp directory
    dir += ".awtmp";
    string e = filesystem::mkdir(dir); /// @todo Check for errors
    //if (e.size()) err += e+"\n";

    // Write the C++ source to file
    e = filesystem::writeFile(dir+"/src.cpp", cpp);
    if (e.size()) err += e+"\n";

    // Change directory and invoke emmake
    auto awdir = filesystem::findAWDir();
    e = filesystem::cwd(dir);
    if (e.size()) err = e+"\n";

    vector<char> wasmbytes;
    string rt_js;

    if (err.size()==0)
    {
        int error_code = emmake(awdir);
        if (error_code)
        {
            err += "Error code: " + to_string(error_code) + "\n";

            // Read the build log
            string build_log;
            e = filesystem::readFile("build.log", build_log);
            if (e.size()) err += e + "\n";
            err += build_log;
        }
        else
        {
            // Read the wasm file
            e = filesystem::readFile("src.wasm", wasmbytes);
            if (e.size()) err += e+"\n";

            // Read the runtime JavaScript
            e = filesystem::readFile("src.js", rt_js);
            if (e.size()) err += e+"\n";
        }
    }

    if (err.size()==0)
    {
        // Assemble the response JSON
        g_response["type"] = "wasm";
        g_response["b64"] = base64Encode(wasmbytes);
        g_response["rt_js"] = rt_js;
    }
    else
    {
        // Assemble error information
        g_response["type"] = "log";
        g_response["msg"] = err;
    }
}

void getTypes()
{
    Json types;

    Json awcppwasm_src;
    awcppwasm_src["type"] = "awcppwasm_src";
    Json awcppwasm_src_attr;
    awcppwasm_src_attr["hash_key"] = "src";
    awcppwasm_src["attributes"] = awcppwasm_src_attr;
    types.push_back(awcppwasm_src);

    Json func;
    func["type"] = "func";
    types.push_back(func);

    Json func_src;
    func_src["type"] = "func_src";
    types.push_back(func_src);

    g_response["type"] = "types";
    g_response["types"] = types;
}

int make( const std::string& awdir, const std::string& cgi )
{
#ifdef WINDOWS
    std::string cmd = "mingw32-make";
#else
    std::string cmd = "make";
#endif
    cmd += " CGI=\""+cgi+"\"";
    cmd += " AW_DIR=\"" + filesystem::fixPath(awdir) + "\"";
    cmd += " -f \"" + filesystem::fixPath( awdir + "/lib/awcpp.makefile" ) + "\"";
    cmd += " > build.log 2>&1";
    return system(cmd.c_str());
}

int emmake( const std::string& awdir )
{
#ifdef WINDOWS
    std::string cmd = "emmake mingw32-make";
#else
    std::string cmd = "emmake make";
#endif
    cmd += " AW_DIR=\"" + filesystem::fixPath(awdir) + "\"";
    cmd += " -f \"" + filesystem::fixPath( awdir + "/lib/awcppwasm.makefile" ) + "\"";
    cmd += " > build.log 2>&1";
    return system(cmd.c_str());
}

string base64Encode(vector<char>& data)
{
    const string tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    string out;
    unsigned int buff(0U);
    int cnt(0);

    for( unsigned char val : data )
    {
        // Shift in 8 bits
        buff = (buff << 8) + val;
        cnt += 8;

        while( cnt >= 6 )
        {
            // Shift out 6 bits
            cnt -= 6;
            int ind = (buff>>cnt)&63;
            out += tab[ind];
        }
    }

    if( cnt>0 ) out += tab[(buff<<(6-cnt))&0x3f];
    while( out.size() % 4 ) out += '=';

    return out;
}

