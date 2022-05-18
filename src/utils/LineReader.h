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

#ifndef LINEREADER_H
#define LINEREADER_H

#include "../aw_json/awvector.h"

#include <string>
#include <map>

class Line : public std::string
{
public:
    Line( const std::string& str) : std::string(str)
    {
    }
    std::vector<Line> split(const std::string& delim);
};

class LineReader
{
public:
    LineReader(const std::string& input);
    Line read();
    bool good() const
    {
        return m_good;
    }

private:
    const std::string& m_input;
    std::size_t m_pos;
    bool m_good;
};

class Parameters
{
public:
    Parameters( const std::string& str );
    AwVector<double>& operator[](const std::string& key)
    {
        return m_params[key];
    }
private:
    std::map<std::string, AwVector<double>> m_params;
};

#endif // LINEREADER_H

