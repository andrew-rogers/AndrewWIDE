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

#ifndef AWSOCKET_H
#define AWSOCKET_H

#include "awfdlistener.h"

#include <string>
#include <sys/socket.h>
#include <arpa/inet.h>

class AwSocket : public AwFDListener
{
 private:
  std::string peer_address;
  uint16_t peer_port;
  sockaddr_in addr_local;
  sockaddr_in addr_peer;
 public:
  AwSocket(void);
  AwSocket(AwSocket &ss);
  AwSocket(int fd);
  ~AwSocket();
  int bind(const std::string &addr, uint16_t port); // TCP server method
  int listen(int backlog=100);
  int connect(const std::string &addr, uint16_t port); // TCP client method 
  int shutdown();
};

#endif
