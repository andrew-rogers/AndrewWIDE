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
#include "awfdlistener.h"

#include <sys/epoll.h>
#include <stdio.h>
#include <iostream>

using namespace std;

AwApp::AwApp()
{
  epoll_fd = epoll_create(20);
  if (epoll_fd == -1) {
    perror("epoll_create");
  }
}

int AwApp::addListener(AwFDListener &l)
{
  cout<<l.id<<": add() fd="<<l.fd<<endl;
  l.ev.events = EPOLLIN | EPOLLOUT | EPOLLET;
  l.ev.data.ptr = (void *)(&l);
  if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, l.fd, &(l.ev)) == -1) {
    perror("epoll_ctl: listen_sock");
  }
  return 0;
}

int AwApp::remove(AwFDListener &l)
{
  cout<<l.id<<": remove()"<<endl;
  if (epoll_ctl(epoll_fd, EPOLL_CTL_DEL, l.fd, NULL) == -1) {
    perror("epoll_ctl: listen_sock");
  }
  return 0;
}

int AwApp::wait(int timeout)
{
  int num_events = epoll_wait(epoll_fd, events, MAX_EVENTS, timeout);
  if (num_events == -1) {
    perror("epoll_wait");
  }
  
  for (int n = 0; n < num_events; ++n) {
    AwFDListener *l = (AwFDListener *)(events[n].data.ptr);
    cout<<l->id<<": Event "<<events[n].events<<endl;
    l->onEvent(events[n].events);
  }
  return num_events;
}
