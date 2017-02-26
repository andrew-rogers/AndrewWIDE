#include "awapp.h"
#include "awfdlistener.h"

class MyListener : public AwFDListener
{
public:
  MyListener(AwApp &a, int fd):AwFDListener(a,fd){}
  virtual int onEvent(uint32_t e){}
};

int main(int argc, char *arg[])
{
    AwApp app;
    MyListener ml(app,0);
    app.wait(5);
}
