#include "awapp.h"
#include "awsocket.h"
#include "awserver.h"

#include <iostream>
#include <stdio.h>

using namespace std;

class MyClient : public AwSocket
{
private:
  bool done;
  static const string response;
public:
  MyClient(AwServer &server) : AwSocket( server ), done(false)
  {
  }
  int onReadable()
  {
    char buffer[1024];
    int nr=read(buffer,1024);
    cout<<"Read: "<<nr<<endl;
    ::write(STDOUT_FILENO,buffer,nr);

    if(!done)
    {
        int nw=write(response.c_str(), response.length());
        cout<<"Written: "<<nw<<endl;
        done=true;
    }
    dispose();
  }
};

const string MyClient::response("HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n<html><body><h1>Hi!</h1></body></html>\n");

class MyServer : public AwServer
{
private:
    public:
  MyServer(AwApp &app, const string &addr, uint16_t port) : AwServer( app, addr, port )
  {
  }
  virtual AwSocket& newSocket()
  {
    MyClient *client=new MyClient(*this);
    cout<<"New client connection."<<endl;
    return *client;
  } 
};

int main(int argc, char *arg[])
{
    AwApp app;
    MyServer s(app, "127.0.0.1", 8082);
    cout<<"EPOLLIN="<<EPOLLIN<<endl;
    cout<<"EPOLLOUT="<<EPOLLOUT<<endl;

    while(1)app.wait(5000);
}
