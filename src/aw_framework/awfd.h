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
#include <stdlib.h>

class AwPoll;
class AwFDListener;

/**
 *  Performs IO operations on file descriptor and calls the registered 
 *   listener methods when notified of IO events. The AwFD objects are
 *   to be registered with an AwPoll instance to receive IO events.
 */

class AwFD
{
  friend class AwPoll;

  public:
    AwFD();
    AwFD(int fd);
    ~AwFD();

    /**
     * @brief Register a listener.
     *
     * @param l the AwFDListener object that handles the events.
     *
     */
    int addListener(AwFDListener &l);

    /**
     * @brief Remove a listener
     *
     * @param l the AwFDListener to be removed.
     *
     */
    int removeListener(AwFDListener &l);

    /**
     * @brief Get number of registered listeners
     *
     * @return the number of registered listeners
     *
     */ 
    int numListeners();

    /**
     * @brief Read the file descriptor
     *
     * @param buffer the memory to store the read data
     *
     * @param count the maximum number of bytes to read
     *
     */
    virtual int read(void *buffer, size_t count);

    /**
     * @brief Write the file descriptor
     *
     * @param buffer the memory that stores the data to be written
     *
     * @param count the maximum number of bytes to write
     *
     * @return number of bytes actually written
     *
     */
    virtual int write( const void *buffer, size_t count);
    virtual int close();
    void setNonBlocking( bool non_blocking=true );
    virtual void notify(short event);
    void setFD(int fd);
    int getFD(){return fd;}

  protected:
    int fd;

  private:
    std::vector<AwFDListener *>listeners;
    AwPoll *poll;
    int poll_index;
};

#endif
