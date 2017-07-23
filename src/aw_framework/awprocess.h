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

#include <unistd.h>
#include <string>
#include <vector>

class AwProcess
{
 public:
  /// @todo Use AwFD here
  int stdin, stdout, stderr;
 private:
  int in_pipe[2];
  int out_pipe[2];
  int err_pipe[2];
 public:
  /// @todo Proper descriptions of constructors and methods
  // cmd should contain a slash if PATH is not to be searched, ie. in a CGI server.
  AwProcess(const char *cmd, char *const args[]);
  AwProcess(const std::string& cmd, std::vector<std::string>& args);
  void run(const char *cmd, char *const args[]);
  ~AwProcess();
};

#endif //AWPROCESS_H
