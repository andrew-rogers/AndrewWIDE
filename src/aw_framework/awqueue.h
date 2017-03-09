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

#ifndef AWQUEUE_H
#define AWQUEUE_H

#include <stdint.h>

/*

Ring buffer implementation of queue

* Uses bit masking instead of modulo arithmetic for indexes, many 
  microcontrollers do not have divide so using AND is a lot quicker.
  However, it means that the buffer size has to be a power of 2.

* Need to post increment indexes for interrupt safety.

*/

class AwQueue
{

  protected:
    uint8_t *buffer;
    uint16_t size_mask;
    uint16_t index_wr, index_rd;

  private:

  public:
    AwQueue(uint8_t *buf, int size); // Size of buffer is a power of 2
    bool push(const uint8_t &data);
    bool pop(uint8_t &data);
};

#endif
