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

#ifndef AWFDLISTENER_H
#define AWFDLISTENER_H

#include <sys/epoll.h>

class AwApp;

class AwFDListener
{
  friend class AwApp;

 protected:
  int fd,id;

  private:
    static int cnt;
    //int id;
    struct epoll_event ev;
    bool dead;

  public:
    AwFDListener();
    ~AwFDListener();
    virtual int onReadable();
    virtual int onWritable();
    virtual int onEvent(uint32_t events);
    int read(void *buffer, int count);
    int write( const void *buffer, int count);
    int dispose();
    int getFD(){return fd;}
};

#endif
