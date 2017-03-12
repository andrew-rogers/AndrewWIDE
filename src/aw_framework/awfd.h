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

#ifndef AWFD_H
#define AWFD_H

//#include "awfdlistener.h"

#include <vector>
#include <sys/epoll.h>

class AwApp;
class AwFDListener;

class AwFD
{
  friend class AwApp;

 protected:
  int id,fd;

  private:
    static int cnt;
    //int id;
    //int fd;
    struct epoll_event ev;
    std::vector<AwFDListener *>listeners;

  public:
    AwFD();
    AwFD(int fd);
    ~AwFD();
    int addListener(AwFDListener &l);
    int removeListener(AwFDListener &l);
    int numListeners();
    int read(void *buffer, int count);
    int write( const void *buffer, int count);
    virtual int close();
    void setNonBlocking( bool non_blocking=true );
    void notify(uint32_t event);
    int getFD(){return fd;}
};

#endif
