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

#ifndef AWAPP_H
#define AWAPP_H

#include "aweventloop.h"

#include <vector>

/**
 *  The main application handling class, a real application should
 *   have only one instance of this. Would usually be instantiated in main
 *   so that it has access to command line arguments.
 */

class AwApp : public AwEventLoop
{
 public:

  static AwApp *instance;

  /**
   *  Constructor
   *  
   *  @param argc Number of command line arguments
   *  @param args The command line arguments
   *
   */
  AwApp( int &argc, char *args[] );

  ~AwApp();
  
  /**
   *  Get the command line arguments as a vector
   *
   *  @return vector of command line arguments
   *
   */
  std::vector<const char *> getArgs();

 protected:
 private:
  std::vector<const char *> args;
};

#endif //AWAPP_H
