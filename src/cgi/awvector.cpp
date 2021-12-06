/*
    AndrewWIDE - Vector extensions for mathematical operations and JSON
                 conversion

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

#include "awvector.h"
#include <fstream>

using namespace std;

template <class T>
void AwVector<T>::fromJsonArray(Json& json)
{
    for( int i=0; i<json.length(); i++ )
    {
        double val=json[i].toNumber();
        vector<T>::push_back(val);
    }
}

template <class T>
Json AwVector<T>::toJsonArray() const
{
    Json json;
    for( int i=0; i<vector<T>::size(); i++ )
    {
        json[i]=(*this)[i];
    }
    return json;
}

template <class T>
void AwVector<T>::save(const std::string fn)
{
    ofstream ofs(fn, ios::trunc | ios::binary);
    if( ofs.is_open() )
    {
        for( int i=0; i<vector<T>::size(); i++ ) {
            T val = (*this)[i];
            ofs.write( (char *)&val, sizeof(val) );
        }
        ofs.close();
    }
}

template <class T>
void AwVector<T>::load(const std::string fn)
{
    vector<T>::clear();
    ifstream ifs(fn, ios::binary);
    if( ifs.is_open() )
    {
        while( ifs.good() ) {
            T val;
            if( ifs.read( (char *)&val, sizeof(val) ) ) vector<T>::push_back(val);
        }
        ifs.close();
    }
}

