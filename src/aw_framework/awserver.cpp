/*
    AndrewWIDE - Application framework
    Copyright (C) 2017  Andrew Rogers

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

#include "awserver.h"

AwServer::AwServer( AwApp &app, const std::string &addr, uint16_t port) : app(app)
{
    bind(addr, port);
    listen();
    app.addListener(*this);
}

int AwServer::onReadable()
{
    int cfd;
    do
    {
        AwSocket &conn = newSocket();
        cfd=conn.getFD();
        if(cfd>0)app.addListener(conn);
        else delete &conn;
    }
    while(cfd>0);
}
