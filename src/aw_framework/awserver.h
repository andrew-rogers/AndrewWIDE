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

#ifndef AWSERVER_H
#define AWSERVER_H

#include "awsocket.h"
#include "awapp.h"
#include "awfdobserver.h"

class AwServer : public AwSocket, public AwFDObserver
{
  private:
  public:
    AwServer(const std::string &addr, uint16_t port);
    virtual int onReadable(AwFD &fd);
    void acceptAndHandle();
    virtual int onConnection(AwFD &fd)=0;
    
};

#endif
