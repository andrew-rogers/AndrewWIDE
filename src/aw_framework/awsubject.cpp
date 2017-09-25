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

#include "awsubject.h"
#include "awobserver.h"

using namespace std;

AwSubject::AwSubject()
{
 
}

AwSubject::~AwSubject()
{
    if( observers.empty() == false )
    {
        for( vector<AwObserver *>::iterator oi=observers.begin(); oi<observers.end(); oi++){
            AwObserver *o=*oi;
            o->removeSubject(this);
        }
    }
}

int AwSubject::addObserver(AwObserver &o)
{
    addObserver(&o);
}

int AwSubject::addObserver(AwObserver *o)
{
    o->addSubject(this);
    observers.push_back(o);
    return observers.size();
}

int AwSubject::removeObserver(AwObserver &o)
{
    removeObserver(&o);
}

int AwSubject::removeObserver(AwObserver *o)
{
    o->removeSubject(this);
    for( vector<AwObserver *>::iterator oi=observers.begin(); oi<observers.end(); oi++){
        if(*oi == o ){    
            observers.erase(oi);
            break;
        }
    }
    return observers.size();
}

int AwSubject::numObservers()
{
  return observers.size();
}

void AwSubject::notify(uint32_t event)
{
    if( observers.empty() == false )
    {
        for( vector<AwObserver *>::iterator oi=observers.begin(); oi<observers.end(); oi++){
            AwObserver *observer = *oi;   
            observer->onEvent( *this, event );
        }
    }
}


