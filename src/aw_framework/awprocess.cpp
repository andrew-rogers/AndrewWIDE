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

#include "awprocess.h"
#include <iostream>

using namespace std;

AwProcess::AwProcess(const string& cmd, vector<string>& args)
{
  cout<<"Process constructed cmd="<<cmd<<endl;
  vector<char*>argv;
  for(int i=0; i<(int)args.size(); i++){
    argv.push_back(&args[i][0]);
  }
  argv.push_back(NULL);
  run(&cmd[0],&argv[0]);
}

void AwProcess::run(const char *cmd, char *const args[])
{
  // Open pipes
  if( pipe(in_pipe) == -1 ) {
    // error
  }
  if( pipe(out_pipe) == -1 ) {
    // error
  }
  if( pipe(err_pipe) == -1 ) {
    // error
  }

  // Do the fork
  pid_t pid = fork();
  if( pid == -1 ) { // Error
    cout<<"fork() failed"<<endl;
  }
  else if( pid == 0 ) { // Child
    // Close write end of stdin pipe
    close(in_pipe[1]);
  
    // Close read end of stdout and stderr pipes
    close(out_pipe[0]);
    close(err_pipe[0]);

    dup2(in_pipe[0], STDIN_FILENO);
    dup2(out_pipe[1], STDOUT_FILENO);
    dup2(err_pipe[1], STDERR_FILENO);

    close(in_pipe[0]);
    close(out_pipe[1]);
    close(err_pipe[1]);

    execvp(cmd, args);
  }
  else { // Parent
    // Close write end of stdout and stderr pipes
    close(out_pipe[1]);
    close(err_pipe[1]);

    // Close read end of stdin pipe
    close(in_pipe[0]);
    
    // Make stdin write fd available
    fd_stdin.setFD( in_pipe[1] );
    
    // Make stdout read fd available
    fd_stdout.setFD( out_pipe[0] );
    
    // Make stderr read fd available
    fd_stderr.setFD( err_pipe[0] );
  }
}

AwProcess::~AwProcess()
{
}
