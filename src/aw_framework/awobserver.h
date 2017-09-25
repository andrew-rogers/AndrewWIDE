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

#ifndef AWOBSERVER_H
#define AWOBSERVER_H

#include <stdint.h>
#include <vector>

class AwSubject;

/**
 *  Observer base class for handling events on subjects. Client code
 *   interested in subject events should re-implement the onEvent method.
 */

class AwObserver
{
    friend AwSubject;

  public:
    AwObserver();
    virtual ~AwObserver();

    /**
     * @brief re-implement this to be notified of other events.
     *
     *  This method is called by derivatives of AwSubject when the subject
     *   notifies an AwObserver instance.
     *
     * @param subject the subject that has a pending event.
     *
     * @param events the event bits specifying the event(s) that occurred.
     */
    virtual int onEvent(AwSubject &subject, uint32_t events)=0;

    /**
     * @brief Get number of subjects referencing this observer
     *
     * @return the number of subjects
     *
     */ 
    int numSubjects();

  private:
    std::vector<AwSubject *>subjects;
    int addSubject(AwSubject *subject);
    int removeSubject(AwSubject *subject);
};

#endif

