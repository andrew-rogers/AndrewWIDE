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

#include "awsocket.h"
#include "awapp.h"
#include "awforkingserver.h"

#include <stdio.h>
#include <string>
#include <iostream>

using namespace std;

class MyListener : public AwFDListener
{
private:
  static const string response;
public:
  MyListener()
  {
  }
  int onReadable(AwFD &fd)
  {
    char buffer[1024];
    int nr=fd.read(buffer,1024);
    cout<<"pid="<<getpid()<<" nr="<<nr<<endl;
    if(nr>=0){
      cout<<"Read: "<<nr<<endl;
      ::write(STDOUT_FILENO,buffer,nr);

      int nw=fd.write(response.c_str(), response.length());
      cout<<"pid="<<getpid()<<" Wrote: "<<nw<<endl;
      
      fd.removeListener(*this);
      fd.close();
    }
    else{
      perror("read");
    }
  }
};

const string MyListener::response("HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n<html><body><h1>Hi!</h1></body></html>\n");

class MyServer : public AwForkingServer
{
private:
  AwApp &app;
    public:
  MyServer(AwApp &app, const string &addr, uint16_t port) : AwForkingServer( addr, port ), app(app)
  {
  }
  virtual int onConnection(AwFD &fd)
  {
    int session_fd = fd.getFD();
    MyListener listener;

    app.add(fd);
    fd.addListener(listener);
    fd.notify(EPOLLIN); // We generate this event as very occasionally the parent gets the event straight after accept() when multiple connections are made simultaneously. If the parent gets the event then the child does not.
    while(fd.numListeners()>0){
      app.wait(1000);
      cout<<"pid="<<getpid()<<", fd = "<<fd.getFD()<<", No. listeners = "<<fd.numListeners()<<endl;
    }
  }
  
};

int main( int argc, char *args[] )
{
  AwApp app;
  MyServer s(app, "127.0.0.1", 8082);

  while(1){
    s.acceptAndHandle(); // Returns when a connection is made
  }
}
