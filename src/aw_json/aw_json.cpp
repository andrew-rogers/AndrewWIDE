/*
    AndrewWIDE - Instrumentation with JSON output
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

#include <fstream>
#include <sstream>

//Json g_response;

using namespace std;

namespace AwJson {

void save(const std::string& filename)
{
    string header;
    string footer;
    if (filesystem::extension(filename).compare("html") == 0)
    {
        header = htmlHeader();
        footer = htmlFooter();
    }

    std::ofstream out(filesystem::fixPath(filename), std::ios::out | std::ios::binary);
    if( out )
    {
        out << header;
        out << g_response;
        out << footer;
        out.close();
    }
}

string htmlHeader()
{
    ostringstream oss;
    oss << "<!DOCTYPE html>\n";
    oss << "<html>\n";
    oss << "    <head>\n";
    oss << "        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" charset=\"UTF-8\">\n";
    oss << htmlScript("AwDocRenderer.js");
    oss << htmlScript("DiagramRenderer.js");
    oss << htmlScript("JsonQuery.js");
    oss << htmlScript("FileSystem.js");
    oss << htmlScript("file.js");
    oss << htmlScript("MathJaxMarkdownRenderer.js");
    oss << htmlScript("svgarray.js");
    oss << htmlScript("AwCppRenderer.js");
    oss << htmlScript("jsonarraybuffers.js");
    oss << htmlScript("PlotRenderer.js");
    oss << htmlScript("Diagram/Geometry.js");
    oss << htmlScript("Diagram/Plot/Plot.js");
    oss << htmlScript("Diagram/Shapes/SignalProcessing.js");
    oss << htmlScript("Diagram/SvgFigure.js");
    oss << htmlScript("XML.js");
    oss << htmlScript("NavBar.js");
    oss << "        <script src=\"https://cdn.jsdelivr.net/npm/marked/marked.min.js\"></script>\n";
    oss << "        <script src=\"https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS-MML_SVG\"></script>\n";
    oss << "    </head>\n";
    oss << "    <body>\n";
    oss << "        <textarea id=\"ta_awjson\">\n";
    return oss.str();
}

string htmlFooter()
{
    ostringstream oss;
    oss << "\n        </textarea>\n";
    oss << "        <script>\n";
    oss << "var awdr = new AwDocRenderer();\n";
    oss << "var ta_awjson = document.getElementById(\"ta_awjson\");\n";
    oss << "ta_awjson.hidden = true;\n";
    oss << "awdr.registerRenderer(\"mjmd\", new MathJaxMarkdownRenderer());\n";
    oss << "awdr.registerRenderer(\"diagram\", new DiagramRenderer());\n";
    oss << "awdr.registerRenderer(\"plot\", new PlotRenderer());\n";
    oss << "awdr.render(ta_awjson.value);\n";
    oss << "awdr.start();\n";
    oss << "        </script>\n";
    oss << "    </body>\n";
    oss << "</html>\n";
    return oss.str();
}

string htmlScript(const string& src)
{
    string prefix = "        <script src=\"../../www/"; // TODO: Manage the AwDoc javascript path somehow. Possibly create a javascript bundle.
    string suffix = "\"></script>\n";
    return prefix + src + suffix;
}

}

