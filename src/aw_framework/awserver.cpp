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

#include <iostream>
#include <signal.h>
#include <errno.h>
#include <stdlib.h>
#include <stdio.h>

using namespace std;

AwServer::AwServer( const std::string &addr, uint16_t port) : AwSocket()
{
    bind(addr, port);
    listen();
    signal(SIGCHLD, SIG_IGN);
    addObserver(*this);
}

int AwServer::onReadable(AwFD &fd)
{
  while(1){
    int fd_connection=::accept(this->fd,NULL,0);
    if( fd_connection == -1 ){
      if( errno == EINTR )break;
      if( errno == EAGAIN || errno == EWOULDBLOCK ) break;
      perror("accept");
      exit(errno);
    }
    
    AwFD *fd=new AwFD(fd_connection);
    onConnection(*fd);  
  }
}

int AwServer::onWritable(AwFD &fd)
{
}

void AwServer::acceptAndHandle()
{
  onReadable(*this);
}

