/*
    AndrewWIDE - Sinewave example
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
#include "plot.h"
#include "cgi_post.h"

#include "math.h"

using namespace std;

void sinewave0();
void sinewave1();

int main(int argc, char *args[])
{
    sinewave0();
    sinewave1();

    sendResponse();

    return 0;
}

void sinewave0()
{
    AwVector<int> vec;
    const double PI = 3.14159265;

    for(int theta=0; theta<32; theta++)
    {
        vec.push_back(static_cast<int>(sin(theta*PI/3)*127));
    }

    plot(vec);
}

void sinewave1()
{
    AwVector<int> vec;
    const double PI = 3.14159265;

    for(int theta=0; theta<32; theta++)
    {
        vec.push_back(static_cast<int>(sin(theta*PI/4)*127));
    }

    plot(vec);
}



