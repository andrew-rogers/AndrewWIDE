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

#include "awqueue.h"

AwQueue::AwQueue(uint8_t *buf, int size) : buffer(buf), index_wr(0), index_rd(0)
{
    size_mask = size-1; // Relies on size being an integer power of 2
}

bool AwQueue::push(const uint8_t &data)
{
    uint16_t wr1 = ( index_wr + 1 ) & size_mask;
    if( wr1 != index_rd){
        buffer[index_wr] = data;
        index_wr = wr1;
	return true;
    }
    return false;
}

bool AwQueue::pop(uint8_t &data)
{
    if( index_wr != index_rd ){
        data = buffer[ index_rd ];
        index_rd = ( index_rd + 1 ) & size_mask;
        return true;
    }
    return false;
}
