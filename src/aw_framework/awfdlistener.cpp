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

#include "awfdlistener.h"
#include "awapp.h"

#include <iostream>

using namespace std;

int AwFDListener::cnt=0;

AwFDListener::AwFDListener() : dead(false)
{
  id=cnt++;
  cout<<id<<": Constructed"<<endl;
}

AwFDListener::~AwFDListener()
{
  cout<<id<<": Destroyed fd="<<fd<<endl;
  //usleep(5000000);
  int r=::close(fd);
  cout<<"r="<<r<<endl;
}

int AwFDListener::onReadable()
{
    return onEvent(EPOLLIN);
}

int AwFDListener::onWritable()
{
    return onEvent(EPOLLOUT);
}

int AwFDListener::onEvent( uint32_t event)
{
    return 0;
}

int AwFDListener::read( void *buffer, int count)
{
    int nr=::read( fd, buffer, count );
    cout<<"Read: "<<nr<<" bytes on fd"<<fd<<endl;
    return nr;
}

int AwFDListener::write( const void *buffer, int count)
{
    int nw=::write( fd, buffer, count);
    cout<<"Written: "<<nw<<" bytes on fd"<<fd<<endl;
    return nw;
}

int AwFDListener::dispose()
{
    dead=true;
}
