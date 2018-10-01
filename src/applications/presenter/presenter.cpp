/*
    AndrewWIDE - Presentation Controller
    Copyright (C) 2018  Andrew Rogers

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

#include "presenter.h"

#include "awapp.h"
#include "awserver.h"

#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <unistd.h>
#include <iostream>
#include <sstream>

using namespace std;

Presenter::Presenter() : screen_fd(0)
{
}

void Presenter::message(AwFD& fd, Json& query)
{
	cout<<"Q"<<query<<endl;
	
	string screen=query["screen"].str();
	string control=query["control"].str();
	string content=query["content"].str();
	
    if(query["screen"].str().length()>0)
	{
		cout<<"Screen>"<<query["screen"].str();
		screen_fd=&fd;
	}
	
	if(control.length()>0)
	{
	    if(screen_fd>0)
	    {
	        Json message;
	        message["content"]=content;
	        write(*screen_fd,message);
	    }
	}
}

void Presenter::closed(AwFD& fd)
{
	if(&fd == screen_fd) screen_fd=0;
}

void Presenter::write(AwFD& fd, Json& json)
{
    ostringstream os;
    os << json;
    fd.write(os.str().c_str(), os.str().length());
}

class MyObserver : public AwFDObserver
{
private:
  AwApp &app;
  Presenter pres;
public:
  MyObserver(AwApp &app) : app(app)
  {
  }

  virtual int onReadable(AwFD &fd)
  {
    char buffer[1024];
    int nr=fd.read(buffer,1023);
    cout<<"pid="<<getpid()<<" nr="<<nr<<endl;
    if(nr==0){
        cout<<"Closed."<<endl;
        pres.closed(fd);
        app.remove(fd);
        delete &fd;
    }
    else if(nr>0){
      cout<<"Read: "<<nr<<endl;
      ::write(STDOUT_FILENO,buffer,nr);
      istringstream in;
      buffer[nr]='\0';
      in.str(buffer);

      Json query;
      in >> query;
      pres.message(fd, query);
    }
    else{
      perror("read");
    }
  }

  virtual int onWritable(AwFD &fd)
  {
  }
};

class MyServer : public AwServer
{

private:
    AwApp &app;
    AwFDObserver &observer;

public:
    // The same observer is used for all connections. This is passed in on the constructor.
    MyServer(AwApp &app, AwFDObserver &observer, const string &addr, uint16_t port) : AwServer( addr, port ), app(app), observer(observer)
    {
    }

    virtual int onConnection(AwFD &fd)
    {
        fd.addObserver(observer);
    }
  
};

int main( int argc, char *args[] )
{
  AwApp app(argc, args);
  MyObserver observer(app);
  MyServer s(app, observer, "127.0.0.1", 8082);

  while(1){
    app.wait(1000);
    cout<<"tick!"<<endl;
  }

  return 0;
}
