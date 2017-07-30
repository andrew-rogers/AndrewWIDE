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

#ifndef AWEVENTQUEUE_H
#define AWEVENTQUEUE_H

/**
 * The AwEventQueue does not use the post-notify pattern used by many
 * other event loop implementations. Instead a deferred execution mechanism
 * is used. This relies on the event object (an instance of an AwEvent 
 * derivative) to hold the context required for event execution. This
 * removes the need for event type handling used in the post-notify pattern.
 * As a result, dispatching, or more accurately, executing, events from the 
 * event queue becomes trivial - just invoke the execute() method of
 * the event.
 */

class AwEventQueue
{
 public:
  int executeEvents();
  int executeEvents(int num_events);
  void postEvent(AwEvent *event);
 protected:
 private:
  std::deque<AwEvent *> queue;
};

#endif // AWEVENTQUEUE_H
