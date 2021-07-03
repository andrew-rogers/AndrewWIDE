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
std::string cppFunc( const std::string& dir, const std::string& func, const std::string& cpp );
std::string cppFuncHdr( const std::string& dir, const std::string& func );
std::string cppMain( const std::string& dir );
int make( const std::string& makefile, const std::string& cgi );

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
        auto cgi = filesystem::stripExtension( filesystem::basename( fn ) );
        if( func.compare("globals") == 0 )
        {
            auto err = filesystem::mkdir(dir); /// @todo Check for errors
            g_response["err"]=filesystem::writeFile(dir+"/globals.h", cpp);
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

            // Create the C++ main
            out = cppMain(dir);
            err += filesystem::writeFile(dir+"/"+cgi+"_awmain.cpp", out);

            // Change directory and invoke make
            auto makefile = filesystem::findAWDir()+"/lib/awcpp.makefile";
            err += filesystem::cwd(dir);
            make(makefile, cgi);

            // Get the build log
            std::string build_log;
            err += filesystem::readFile("build.log", build_log);
            g_response["build_log"]=build_log;
            g_response["err"]=err;
            g_response["bin"]=dir+"/"+cgi;
            g_response["name"]=func;
        }
    }
    else if( cmd == "run" )
    {
        std::string err;
        auto bin = query["bin"].str()+".so";
        auto func = query["func"].str();
        void* dlh = dlopen(bin.c_str(), RTLD_LAZY);
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
            if( func_resp != NULL ) g_response["resp"]=*func_resp;
            else err += "Can't access response JSON.\n";

            dlclose(dlh);
        }
        else
        {
            err = "Can't load module: "+bin;
        }

        g_response["err"] = err;
    }

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
        out += "#include \"../globals.h\"\n";
    }
    out += "\n";
    out += "extern \"C\" void "+func+"()\n";
    out += "{\n";
    out += cpp;
    out += "}\n";
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

std::string cppMain( const std::string& dir )
{
    Json list;
    int cnt=filesystem::listFiles( dir+"/func.d", list);

    std::string incs;
    std::string maps;
    for( int i=0; i<cnt; i++ )
    {
        auto fn=list[i][filesystem::KEY_NAME].str();
        if( fn.size()>=10 && fn.substr(fn.size()-5).compare("_aw.h") == 0 )
        {
            fn=fn.substr(0,fn.size()-5);
            incs+="#include \"func.d/"+fn+"_aw.h\"\n";
            maps+="    functions[\""+fn+"\"]="+fn+";\n";
        }
    }

    std::string out;
    out += "// This file is automatically generated by AndrewWIDE, changes may be lost.\n\n";
    out += "// Include all the functions.\n";
    out += incs;
    out += "\n";
    out += "#include \"cgi_post.h\"\n";
    out += "#include <map>\n";
    out += "#include <string>\n";
    out += "\n";
    out += "using namespace std;\n";
    out += "\n";
    out += "int main(int argc, char *args[])\n";
    out += "{\n";
    out += "    getQuery();\n";
    out += "\n";
    out += "    // Create map of functions.\n";
    out += "    map<string,void(*)()> functions;\n";
    out += maps;
    out += "\n";
    out += "    string func_name(g_query[\"name\"].str());\n";
    out += "\n";
    out += "    // Search for function and call it if it exists.\n";
    out += "    auto func=functions.find(func_name);\n";
    out += "    if( func!=functions.end() )\n";
    out += "    {\n";
    out += "        func->second();\n";
    out += "    }\n";
    out += "    else\n";
    out += "    {\n";
    out += "        g_response[\"error\"]=\"Function not found: \"+func_name;\n";
    out += "    }\n";
    out += "\n";
    out += "    sendResponse();\n";
    out += "\n";
    out += "    return 0;\n";
    out += "}\n";

    return out;
}

int make( const std::string& makefile, const std::string& cgi )
{
#ifdef WINDOWS
    std::string cmd = "mingw32-make CGI=\""+cgi+"\" -f \""+filesystem::fixPath(makefile)+"\" > build.log 2>&1";
#else
    std::string cmd = "make CGI=\""+cgi+"\" -f \""+makefile+"\" > build.log 2>&1";
#endif
    return system(cmd.c_str());
}

