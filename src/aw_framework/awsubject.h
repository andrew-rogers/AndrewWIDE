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

#ifndef AWSUBJECT_H
#define AWSUBJECT_H

#include <stdint.h>
#include <vector>

class AwObserver;

/**
 *  Notifies registered observers of events.
 */

class AwSubject
{
  public:
    AwSubject();
    virtual ~AwSubject();

    /**
     * @brief Register an observer.
     *
     * @param o the AwObserver object that handles the events.
     *
     */
    int addObserver(AwObserver &o);

    /**
     * @brief Register an observer.
     *
     * @param o pointer to the AwObserver object that handles the events.
     *
     */
    int addObserver(AwObserver *o);

    /**
     * @brief Remove an observer
     *
     * @param o the AwObserver to be removed.
     *
     */
    int removeObserver(AwObserver &o);

    /**
     * @brief Remove an observer
     *
     * @param o pointer to the AwObserver to be removed.
     *
     */
    int removeObserver(AwObserver *o);

    /**
     * @brief Get number of registered observers
     *
     * @return the number of registered observers
     *
     */ 
    int numObservers();

    /**
     * @brief Notify all the observers of an event
     *
     * @param event the event code.
     *
     */
    void notify(uint32_t event);

  protected:

  private:
    std::vector<AwObserver *>observers;
};

#endif

