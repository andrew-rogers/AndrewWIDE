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

#include "awobserver.h"
#include "awsubject.h"

using namespace std;

AwObserver::AwObserver()
{
  
}

AwObserver::~AwObserver()
{
    //Iterate through subjects to remove this observer.
    for( vector<AwSubject *>::iterator si=subjects.begin(); si<subjects.end(); si++){
        AwSubject *s=*si;
        s->removeObserver(*this);
    }
}

int AwObserver::onEvent(AwSubject &subject, uint32_t events)
{
    return 0;
}

int AwObserver::numSubjects()
{
  return subjects.size();
}

int AwObserver::addSubject(AwSubject *subject)
{
    subjects.push_back(subject);
    return subjects.size();
}

int AwObserver::removeSubject(AwSubject *subject)
{
    for( vector<AwSubject *>::iterator si=subjects.begin(); si<subjects.end(); si++){
        if(*si == subject ){
            subjects.erase(si);
            break;
        }
    }
    return subjects.size();
}

