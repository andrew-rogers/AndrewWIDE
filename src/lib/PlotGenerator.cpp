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

PlotGenerator* PlotGenerator::m_current = NULL;

void PlotGenerator::xlabel(const std::string& str)
{
    m_data.get()->addMember("xlabel", str);
}

void PlotGenerator::ylabel(const std::string& str)
{
    m_data.get()->addMember("ylabel", str);
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

