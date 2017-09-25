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

#include "awpoll.h"
#include "awfd.h"

#include <stdio.h>

AwPoll::AwPoll()
{
  
}

int AwPoll::add(AwFD &fd)
{
  fd.setNonBlocking(true);
  pollfd pfd;
  pfd.fd = fd.fd;
  pfd.events = POLLIN;
  pfd.revents=0;
  pollfds.push_back(pfd);
  fds.push_back(&fd);
  fd.poll=this;
  fd.poll_index=pollfds.size()-1;
  return 0;
}

int AwPoll::remove(AwFD &fd)
{
  for( unsigned int i=0; i<fds.size(); i++){
    if( fds[i]==&fd ){
      pollfds.erase(pollfds.begin()+i);
      fds.erase(fds.begin()+i);
    }
  }
  fd.poll=0;
  fd.poll_index=-1;
  return 0;
}

int AwPoll::wait(int timeout)
{
  int nfds = fds.size();
  if( nfds<1 ) return 0;
  
  // Call the operating system poll() to wait for IO
  int num_events = ::poll( &pollfds[0], nfds, timeout );

  if (num_events == -1) {
    perror("AwPoll::wait()");
  }
  
  // Search through FDs to see if any revents flags are set
  for (int n = 0; n < nfds; ++n) {
    if( pollfds[n].revents ){
      AwFD *fd = fds[n];
      if(pollfds[n].revents & POLLOUT) pollfds[n].events &= ~POLLOUT; // Clear the POLLOUT flag.
      fd->notify((uint32_t)(pollfds[n].revents)); // Notify client code of event via callback mechanism
    }
  }
  return num_events;
}

void AwPoll::enableWriteEvent(AwFD *fd)
{
  pollfds[fd->poll_index].events |= POLLOUT; // Set the POLLOUT flag
}
