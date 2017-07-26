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

#ifndef AWPOLL_H
#define AWPOLL_H

#include <vector>
#include <poll.h>

class AwFD;

/**
 *  Polls a list of file descriptors using the operating system poll(),
 *   notifies file descriptors of any pending IO activity. This class also
 *   maintians the list of file descriptors to be monitored in poll(). A
 *   parallel list of AwFD pointers is also stored to provide the call-back
 *   mechanism to the client code.
 */

class AwPoll
{
 protected:
  std::vector<AwFD *>fds;     ///< AwFD pointers for client code callbacks.
  std::vector<pollfd>pollfds; ///< OS file descritor poll flags
  
 public:
  AwPoll();

  /**
   * @brief Adds the AwFD to the poll list.
   *
   * @param fd the AwFD that is to be monitored for IO
   *
   */
  int add(AwFD &fd);

  /**
   * @brief Remove an AwFD from the poll list.
   *
   * @param fd the AwFD object being removed.
   *
   */
  int remove(AwFD &fd);

  /**
   * @brief Wait for some IO activity.
   *
   * @param Maximum time to wait for in milliseconds, a negative timeout
   *  waits forever.
   *
   */
  int wait(int timeout);
};

#endif // AWPOLL_H
