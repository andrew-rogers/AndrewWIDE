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

#include <vector>
#include <poll.h>

class AwPoll;
class AwFDListener;

class AwFD
{
  friend class AwPoll;

 protected:
  int fd;

  private:
    std::vector<AwFDListener *>listeners;
    pollfd* poll_flags;

  public:
    AwFD();
    AwFD(int fd);
    ~AwFD();
    int addListener(AwFDListener &l);
    int removeListener(AwFDListener &l);
    int numListeners();
    virtual int read(void *buffer, size_t count);
    virtual int write( const void *buffer, size_t count);
    virtual int close();
    void setNonBlocking( bool non_blocking=true );
    virtual void notify(short event);
    void setFD(int fd){this->fd=fd;}
    int getFD(){return fd;}
};

#endif
