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

#include "awsocket.h"
#include "awserver.h"

#include <string.h>
#include <stdio.h>
#include <iostream>

using namespace std;

AwSocket::AwSocket() : AwFD()
{
    // TCP socket
  
    if ( (fd = socket(AF_INET, SOCK_STREAM, 0)) < 0 )
    {
      // Error
    }

    cout<<"AwSocket fd="<<fd<<endl;

    // Socket can re-use port
    int enable = 1;
    if (setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &enable, sizeof(int)) < 0) {
      // Error
    }

}

// Construct AwSocket object from file descriptor.
AwSocket::AwSocket(int fd) : AwFD(fd)
{
  
}

AwSocket::~AwSocket()
{
  cout<<"~AwSocket() fd="<<getFD()<<endl;
    if(getFD()>=0)
    {
        shutdown();
        close();
    }
}

int AwSocket::bind(const string &addr, uint16_t port)
{
	
    memset(&addr_local, 0, sizeof(addr_local));
    addr_local.sin_family = AF_INET;
    addr_local.sin_port = htons(port);
    addr_local.sin_addr.s_addr = INADDR_ANY;
    int ret=inet_pton( AF_INET, addr.c_str(), &addr_local.sin_addr.s_addr);
    printf("0x%08x\n", addr_local.sin_addr.s_addr);

    ret=::bind(getFD(), (struct sockaddr*)&addr_local, sizeof(addr_local));
    if( ret != 0 )
    {
        // error
    }
    return ret;
}

int AwSocket::listen( int backlog )
{
    int ret=::listen(getFD(), backlog);
    if( ret != 0 )
    {
        // error
    }
    return ret;
}

int AwSocket::shutdown()
{
    char buffer[1024];
    ::shutdown(getFD(), SHUT_WR);
    cout<<"Shutdown"<<endl;
    for(;;)
    {
      int res=::read(getFD(), buffer, 1024);
        if(res < 0) {
            perror("reading");
            break;
        }
        if(res == 0)
            break;
    }
}

int AwSocket::close()
{
  cout<<"AwSocket::close() fd="<<getFD()<<" pid="<<getpid()<<endl;
    int ret=AwFD::close();
    return(ret);
}
