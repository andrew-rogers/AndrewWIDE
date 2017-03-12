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

#include "awapp.h"
#include "awfd.h"
#include "awfdlistener.h"

#include <sys/epoll.h>
#include <stdio.h>
#include <fcntl.h>
#include <iostream>

using namespace std;

AwApp::AwApp()
{
  epoll_fd = epoll_create(20);
  if (epoll_fd == -1) {
    perror("AwApp: epoll_create");
  }
}

int AwApp::add(AwFD &fd)
{
  cout<<fd.id<<": add() fd="<<fd.fd<<endl;

  // Set file to non-blocking
  int flags = fcntl(fd.fd, F_GETFL, 0);
  flags = flags | O_NONBLOCK;
  fcntl(fd.fd, F_SETFL, flags);

  fd.ev.events = EPOLLIN | EPOLLOUT | EPOLLET;
  fd.ev.data.ptr = (void *)(&fd);
  if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, fd.fd, &(fd.ev)) == -1) {
    perror("AwApp: add");
  }
  return 0;
}

int AwApp::remove(AwFD &fd)
{
  cout<<fd.id<<": remove() fd="<<fd.fd<<endl;
  if (epoll_ctl(epoll_fd, EPOLL_CTL_DEL, fd.fd, NULL) == -1) {
    perror("AwApp: remove");
  }
  return 0;
}

int AwApp::wait(int timeout)
{
  int num_events = epoll_wait(epoll_fd, events, MAX_EVENTS, timeout);
  if (num_events == -1) {
    perror("AwApp: epoll_wait");
  }
  
  for (int n = 0; n < num_events; ++n) {
    AwFD *l = (AwFD *)(events[n].data.ptr);
    uint32_t event = events[n].events;
    l->notify(event);
    
    if( l->fd < 0 )
    {
      //remove( *l );
    }
  }
  return num_events;
}
