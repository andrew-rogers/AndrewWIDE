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

#include <stdint.h>

class AwFD;

/**
 *  Listener base class for handling events on file descriptors. Client code
 *   interested in file descriptor events should re-implement the virtual
 *   methods.
 */

class AwFDListener
{
  public:
    AwFDListener();
    ~AwFDListener();

    /**
     * @brief re-implement this for specialised reading of file descriptor.
     *
     * @param fd the file descriptor that has become readable.
     *
     */ 
    virtual int onReadable(AwFD &fd);

    /**
     * @brief re-implement this to be notified that the file descriptor is writable.
     *  this method is only called after a partial write, when the descriptor
     *  becomes writable again. The initial write should be called from outside of this
     *  method.
     *
     * @param fd the file descriptor that has become writable.
     *
     */ 
    virtual int onWritable(AwFD &fd);

    /**
     * @brief re-implement this to be notified of other events.
     *
     *  This method is also called if onReadable or onWritable are not
     *  overridden and a read or write event occurs.
     *
     * @param fd the file descriptor that has a pending event.
     *
     * @param events the event bits specifying the event(s) that occurred.
     */
    virtual int onEvent(AwFD &fd, uint32_t events);
};

#endif
