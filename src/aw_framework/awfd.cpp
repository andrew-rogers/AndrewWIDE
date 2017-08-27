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
#include "awfdlistener.h"
#include "awapp.h"

#include <fcntl.h>
#include <unistd.h>

using namespace std;

AwFD::AwFD() : fd(-1), poll(0)
{
 
}

AwFD::AwFD(int fd) : fd(fd), poll(0)
{
  AwApp *awapp=AwApp::instance;
  if(awapp)awapp->add(*this);
}

AwFD::~AwFD()
{
  AwApp *awapp=AwApp::instance;
  if(awapp)awapp->remove(*this);
  if(fd>=0){ 
    close();
  }
}

void AwFD::setFD(int fd)
{
  this->fd=fd;
  AwApp *awapp=AwApp::instance;
  if(awapp)awapp->add(*this);
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

int AwFD::read( void *buffer, size_t count)
{
    int nr=::read( fd, buffer, count );
    return nr;
}

int AwFD::write( const void *buffer, size_t count)
{
    int nw=::write( fd, buffer, count);

    // If we can't write it all out then enable the write event so that listeners 
    // are notified when more data can be written out.
    if( nw < count && nw != 0 && poll) poll->enableWriteEvent(this);
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

void AwFD::notify(short event)
{
  for( vector<AwFDListener *>::iterator li=listeners.begin(); li<listeners.end(); li++){
    AwFDListener *listener = *li;
    
    if( (fd > 0) && (event & POLLIN) ) listener->onReadable(*this);
    if( (fd > 0) && (event & POLLOUT) ) {
      listener->onWritable(*this);
    }
    if( (fd > 0) && (event & ~( POLLIN | POLLOUT)) ) listener->onEvent( *this, event );
  }
}

int AwFD::close()
{
  if(fd>0){
    ::close(fd);
  }
  fd=-1;
}
