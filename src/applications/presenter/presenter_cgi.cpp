/*
    AndrewWIDE - Presenter CGI, uses long polling
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

#include "cgi_post.h"
#include "awsocket.h"
#include "awfdobserver.h"
#include "awapp.h"

#include <sstream>
#include <iostream>

using namespace std;

class MyObserver : public AwFDObserver
{
private:
  bool done;
public:
  MyObserver() : done(false)
  {
  }

  virtual int onReadable(AwFD &fd)
  {
    char buffer[1024];
    int nr=fd.read(buffer,1023);
    cerr<<"onRead()"<<endl;
    if(nr==0){
        done=true;
        g_response["status"]="NO CONTROL SERVER";
    }
    else if(nr>0){
      buffer[nr]='\0';
      istringstream in;
      in.str(buffer);

      Json msg;
      in >> msg;
      g_response["status"]="OK";
      g_response["content"]=msg["content"].str();
      cerr<<g_response;
      done=true;
    }
    else{
      perror("read");
    }
  }

  virtual int onWritable(AwFD &fd)
  {
  }

  bool isDone()
  {
    return done;
  }
};

int main(int argc, char *args[])
{

    AwApp app(argc, args);
    MyObserver observer;
  
  
    getQuery();

    AwSocket socket;
    socket.addObserver(observer);
    socket.connect("127.0.0.1",8082);

    g_response["status"]="TIMEOUT";

    ostringstream os;
    os << g_query;
    socket.write(os.str().c_str(), os.str().length());

    int cnt=0;
    while(cnt<5)
    {
        int n=app.wait(1000);
        if(n>0) break;
        cnt++;
    }
        
    sendResponse();

    return 0;
}

