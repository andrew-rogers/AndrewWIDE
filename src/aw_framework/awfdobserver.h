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

#ifndef AWFDOBSERVER_H
#define AWFDOBSERVER_H

#include "awobserver.h"

#include <stdint.h>
#include <vector>

class AwFD;

/**
 *  Observer class for handling events on file descriptors. Client code
 *   interested in file descriptor events should re-implement the virtual
 *   methods.
 */

class AwFDObserver : public AwObserver
{
    friend AwFD;

  public:
    AwFDObserver();
    ~AwFDObserver();

    /**
     * @brief implement this for specialised reading of file descriptor.
     *
     * @param fd the file descriptor that has become readable.
     *
     */ 
    virtual int onReadable(AwFD &fd)=0;

    /**
     * @brief implement this to be notified that the file descriptor is
     *  writable.
     *  
     *  this method is only called after a partial write, when the descriptor
     *  becomes writable again. The initial write should be called from outside
     *  of this method.
     *
     * @param fd the file descriptor that has become writable.
     *
     */ 
    virtual int onWritable(AwFD &fd)=0;

    /**
     * @brief re-implement this to be notified of other events.
     *
     *  This method is called when a file descriptor has a pending event.
     *
     * @param subject the file descriptor that has a pending event.
     *
     * @param events the event bits specifying the event(s) that occurred.
     */
    virtual int onEvent(AwSubject &subject, uint32_t events);

  private:
    
};

#endif

