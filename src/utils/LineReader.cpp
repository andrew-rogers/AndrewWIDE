/*
    AndrewWIDE - Text reading utilities
    Copyright (C) 2022  Andrew Rogers

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

#include "LineReader.h"

std::vector<Line> Line::split(const std::string& delim)
{
    std::vector<Line> ret;
    std::size_t pos = 0U;
    std::size_t found;
    while ( (found = find(delim, pos)) != std::string::npos)
    {
        Line l( substr( pos, found-pos ) );
        ret.push_back( l );
        pos = found + delim.size();
    }
    Line l( substr( pos, delim.size()-pos ) );
    ret.push_back( l );
    return ret;
}

LineReader::LineReader(const std::string& input) : m_input(input), m_pos(0U), m_good(true)
{
}

Line LineReader::read()
{
    std::string line;
    std::size_t found = m_input.find("\n", m_pos);
    if (found != std::string::npos)
    {
        std::size_t i1 = found;
        if ((found > 0) && (m_input[found-1]=='\r')) i1 = found - 1;
        line = m_input.substr(m_pos, i1-m_pos);
        m_pos = found + 1;
    }
    else
    {
        m_good = false;
    }
    return line;
}

Parameters::Parameters( const std::string& str )
{
    LineReader lr(str);
    while( lr.good() )
    {
        auto line = lr.read();
        auto parts = line.split(":");
        if (parts.size() == 2)
        {
            auto key = parts[0];
            auto vals = parts[1].split(",");
            AwVector<double> vec;
            for (auto v: vals) vec.push_back(stod(v));
            m_params[key]=vec;
        }
    }
}

