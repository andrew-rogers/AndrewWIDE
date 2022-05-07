/*
    AndrewWIDE - Debug utilites
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

#include "Debug.h"

#include <sys/time.h>

void logts(const std::string& msg)
{
    struct timeval tv;
	gettimeofday(&tv, NULL);
	std::string sec = std::to_string(tv.tv_sec); 
	std::string ms = std::to_string(tv.tv_usec / 1000);
	while (ms.size()<3) ms = "0" + ms;

    std::string tsmsg = sec + "." + ms + ": " + msg;
    Json log;
    log["type"] = "log";
    log["msg"] = tsmsg;
    g_response.push_back(log);
}

