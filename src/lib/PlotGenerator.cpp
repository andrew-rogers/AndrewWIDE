/*
 * AndrewWIDE - Generate JSON responses for graph plotting.
 * Copyright (C) 2022  Andrew Rogers
 *
 * SPDX-License-Identifier: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#include "PlotGenerator.h"

PlotTrace& PlotTrace::marker( const std::string& str )
{
    JsonObject marker;
    std::string sym=str;
    if (str=="o")
    {
        sym="circle-open";
    }
    marker.addMember("symbol", sym);
    addMember("marker", marker);
    addMember("mode", "markers"); // https://plotly.com/javascript/line-and-scatter/
    return *this;
}

PlotGenerator* PlotGenerator::m_current = NULL;

void PlotGenerator::unitCircle(const std::string& linestyle)
{
    JsonObject circle;
    circle.addMember("type","circle");
    circle.addMember("x0",-1.0);
    circle.addMember("x1",1.0);
    circle.addMember("y0",-1.0);
    circle.addMember("y1",1.0);
    circle.addMember("xref","x");
    circle.addMember("yref","y");
    circle.addMember("opacity",0.2);

    JsonArray shapes;
    shapes.addElement(circle);

    JsonObject xaxis;
    xaxis.addMember("constrain","domain");

    JsonObject yaxis;
    yaxis.addMember("scaleanchor","x");

    JsonObject layout;
    layout.addMember("shapes",shapes);
    layout.addMember("xaxis",xaxis);
    layout.addMember("yaxis",yaxis);

    m_data.get()->addMember("layout",layout);
}

void PlotGenerator::xlabel(const std::string& str)
{
    m_data.get()->addMember("xlabel", str);
}

void PlotGenerator::ylabel(const std::string& str)
{
    m_data.get()->addMember("ylabel", str);
}

void unitCircle(const std::string& linestyle)
{
    auto plot = PlotGenerator::current();
    plot->unitCircle(linestyle);
}

void xlabel( const std::string& str)
{
    auto plot = PlotGenerator::current();
    plot->xlabel(str);
}

void ylabel( const std::string& str)
{
    auto plot = PlotGenerator::current();
    plot->ylabel(str);
}

