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

#ifndef AWEVENT_H
#define AWEVENT_H

/**
 * Base class for all events in AndrewWIDE, all context relevant to the
 * processing of the event should be passed via member variables of the 
 * derived class. For example, an IO related event will probably operate
 * on a file descriptor, therefore an AwFD object reference is probably
 * a required member of the derived event. Such a reference should
 * probably be implemented as an std::weak_ptr as the event does not have
 * ownership of the AwFD object, nor can it be sure of it's lifetime.
 */

class AwEvent
{
 public:
  void execute()=0;
 protected:
 private:
};

#endif // AWEVENT_H
