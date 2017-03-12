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

#ifndef AWAPP_H
#define AWAPP_H

#include <sys/epoll.h>

class AwFD;

class AwApp
{
  public:
    static const int MAX_EVENTS = 20;

  private:
    struct epoll_event events[MAX_EVENTS];

  public:
    int epoll_fd;

  public:
    AwApp();
    int add(AwFD &fd);
    int remove(AwFD &fd);
    int wait(int timeout);
};

#endif
