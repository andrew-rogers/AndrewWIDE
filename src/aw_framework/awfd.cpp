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

#include "awfd.h"
#include "awapp.h"
#include "awfdlistener.h"

#include <fcntl.h>

#include <iostream>

using namespace std;

int AwFD::cnt=0;

AwFD::AwFD() : fd(-1)
{
  id=cnt++;
  cout<<id<<": AwFD()"<<endl;
}

AwFD::AwFD(int fd) : fd(fd)
{
  id=cnt++;
  cout<<id<<": AwFD()"<<endl;
}

AwFD::~AwFD()
{
  cout<<id<<": ~AwFD() fd="<<fd<<endl;
  if(fd>=0){ 
    close();
  }

  //usleep(5000000);
}

int AwFD::addListener(AwFDListener &l)
{
  listeners.push_back(&l);
  return listeners.size();
}

int AwFD::removeListener(AwFDListener &l)
{
  for( vector<AwFDListener *>::iterator li=listeners.begin(); li<listeners.end(); li++){
    if(*li == &l ){
      listeners.erase(li);
      break;
    }
  }
  return listeners.size();
}

int AwFD::numListeners()
{
  return listeners.size();
}

int AwFD::read( void *buffer, int count)
{
    int nr=::read( fd, buffer, count );
    cout<<"Read: "<<nr<<" bytes on fd"<<fd<<endl;
    return nr;
}

int AwFD::write( const void *buffer, int count)
{
    int nw=::write( fd, buffer, count);
    cout<<"Wrote: "<<nw<<" bytes on fd"<<fd<<endl;
    return nw;
}

void AwFD::setNonBlocking( bool non_blocking )
{
  int flags = fcntl( fd, F_GETFL, 0 );
  if( non_blocking ){
    flags |= O_NONBLOCK;
  }
  else{
    flags &= ~O_NONBLOCK;
  }
  fcntl( fd, F_SETFL, flags );
}

void AwFD::notify(uint32_t event)
{
    cout<<"pid: "<<getpid()<<" id="<<id<<" fd="<<fd<<": Event "<<event<<endl;
    for( vector<AwFDListener *>::iterator li=listeners.begin(); li<listeners.end(); li++){
        AwFDListener *listener = *li;
	cout<<id<<" fd="<<fd<<": Event "<<event<<endl;
    
	if( (fd > 0) && (event & EPOLLIN) ) listener->onReadable(*this);
	if( (fd > 0) && (event & EPOLLOUT) ) listener->onWritable(*this);
	if( (fd > 0) && (event & ~( EPOLLIN | EPOLLOUT)) ) listener->onEvent( *this, event );
    }
}

int AwFD::close()
{
  if(fd>0){
    //app.remove(*this);
    ::close(fd);
  }
  fd=-1;
}
