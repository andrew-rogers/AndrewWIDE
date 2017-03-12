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

#include "awserver.h"

#include <iostream>
#include <signal.h>

using namespace std;

AwServer::AwServer( AwApp &app, const std::string &addr, uint16_t port) : AwSocket(), app(app), forking(false)
{
    bind(addr, port);
    listen();
    signal(SIGCHLD, SIG_IGN);
    //app.add(*this);
    //addListener(*this);
}

int AwServer::onReadable(AwFD &fd)
{
  cout<<"Yes"<<endl;
  return onConnection(fd);
}

#if 0
int AwServer::onReadable(AwFD &fd)
{
    int cfd;
    //if(child) return -1;
    do
    {
        AwSocket conn = newSocket();
        cfd=conn->getFD();
        //if(cfd>0)app.addListener(conn);
        if(cfd>0){
	  int pid=fork();
	  if( pid == 0 ) {
	    //close(fd); // Close server fd in child
	    //fd=-1;
	    cout<<"Child pid="<<getpid()<<endl;
	    close();
	    app.addListener(*conn);
	    //child=true;
	    break; // If child then break out of this loop.
	  }
	  else{
	    conn->close();
	    //::close(cfd);
	  }
	}
        else delete conn;
    }
    while(cfd>0);
}
#endif

AwSocket *AwServer::accept()
{
  cout<<"AwServer::accept() pid="<<getpid()<<endl;
    AwSocket *conn = new AwSocket(*this);
    if(conn->getFD()<0){
      delete conn;
      conn=0;
    }
    else{
      //app.add(*conn);
      if(forking){
	int pid=fork();
	if(pid==0){ // Child
	  cout<<"fork() child pid="<<getpid()<<endl;
          app.add(*conn);
	  conn->notify(EPOLLIN);
	  close();
	}
	else{ // Parent or failed
	  conn->close();
	  //::close(conn->getFD());
	  //delete conn;
	  conn=0;
	}
      }
      else app.add(*conn);
    }
    return conn;
}

