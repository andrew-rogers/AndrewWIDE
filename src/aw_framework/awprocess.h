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

#ifndef AWPROCESS_H
#define AWPROCESS_H

#include "awfd.h"

#include <unistd.h>
#include <string>
#include <vector>

/**
 *  Process wrapper class, forks a user specified command line process and
 *   creates pipes for the input and output to and from the process.
 */

class AwProcess
{
 public:
  AwFD fd_stdin;  ///< Write to this file descriptor for process input
  AwFD fd_stdout; ///< Read from this file descriptor for process output
  AwFD fd_stderr; ///< Read from this file descriptor for process error
 private:
  int in_pipe[2];
  int out_pipe[2];
  int err_pipe[2];

  void run(const char *cmd, char *const args[]);

 public:

  /*
   * @param cmd name of command to run. Should contain a slash if PATH is not
   *  to be searched, ie. in a CGI server.
   *
   * @param args the command line arguments that are passed to the process. 
   */
  AwProcess(const std::string& cmd, std::vector<std::string>& args);
  ~AwProcess();
};

#endif //AWPROCESS_H
