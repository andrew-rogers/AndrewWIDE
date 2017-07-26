#include <CppUTest/CommandLineTestRunner.h>
#include "awprocess.h"
#include "awpoll.h"
#include "awfdlistener.h"

#include <unistd.h>

using namespace std;

TEST_GROUP(ProcessTestGroup)
{
};

TEST(ProcessTestGroup, FirstTest)
{
  // Perform simple process test
  string cmd("printf");
  vector<string> args;
  args.push_back(cmd);
  args.push_back("0x40=%d");
  args.push_back("0x40");
  AwProcess process(cmd, args);
  char buf[1024];
  int nread=process.fd_stdout.read(buf, 1023);
  buf[nread]='\0';
  STRCMP_EQUAL("0x40=64", buf);
}

TEST(ProcessTestGroup, SecondTest)
{
  // Perform process test with input
  string cmd("md5sum");
  vector<string> args;
  args.push_back(cmd);
  AwProcess process(cmd, args);
  process.fd_stdin.write("Hello",5);
  process.fd_stdin.close();
  char buf[1024];
  int nread=process.fd_stdout.read(buf, 1023);
  buf[nread]='\0';
  STRCMP_CONTAINS("8b1a9953c4611296a827abf8c47804d7", buf);
}

TEST(ProcessTestGroup, ThirdTest)
{
  // Perform non-blocking reads of process output
  string cmd("sh");
  vector<string>args;
  args.push_back(cmd);
  args.push_back("./slow.sh");
  args.push_back("cnt");
  AwProcess process(cmd, args);
  process.fd_stdout.setNonBlocking(true);
  string str="";
  for( int i=0; i<10; i++) {
    char buf[1024];
    int nread=process.fd_stdout.read(buf, 1023);
    if(nread >= 0){
      buf[nread]='\0';
      str+=buf; // Add read data to string
    }
    str+="."; // Add dot to output string to mark read returned with no data
    usleep(250000); // Delay 250 ms
  }
  STRCMP_CONTAINS("...", str.c_str());
  STRCMP_CONTAINS("1one", str.c_str());
  STRCMP_CONTAINS("2two", str.c_str());
  STRCMP_CONTAINS("3three", str.c_str());
}

TEST(ProcessTestGroup, FourthTest)
{
  // Perform process test capture stderr
  string cmd("sh");
  vector<string> args;
  args.push_back(cmd);
  args.push_back("-c");
  args.push_back("printf 'Hello there!' 1>&2");
  AwProcess process(cmd, args);
  char buf[1024];
  int nread=process.fd_stderr.read(buf, 1023);
  buf[nread]='\0';
  STRCMP_EQUAL("Hello there!", buf);
}

TEST(ProcessTestGroup, FifthTest)
{
  // Try a big write to the process.
  const int bufsize=1024*1024;
  char buf[bufsize];
  for( int i=0; i<bufsize; i++) buf[i]='A'+(i%26);
  buf[bufsize-1]='\n';
  string cmd("sh");
  vector<string> args;
  args.push_back(cmd);
  args.push_back("./slow.sh");
  args.push_back("linesum");
  AwProcess process(cmd, args);

  // As it's blocking IO we should be able to write all 1048576 bytes.
  int nwritten = process.fd_stdin.write(buf,bufsize);
  CHECK_EQUAL(1048576,nwritten);

  // Get the computed md5sum
  int nread = process.fd_stdout.read(buf,bufsize);
  buf[nread]='\0';
  STRCMP_CONTAINS("aa0f3ea20320211ab1b08cc65fb732e4",buf);
}

TEST(ProcessTestGroup, SixthTest)
{
  // Try a big write to the process.

  // Make a listener to handle writable callbacks.
  class Writer : public AwFDListener
  {
  public:
    char *data;
    int len;
    int nw;
    int cnt;

    Writer( char *buf, int len ) : data(buf), len(len), nw(0), cnt(0){
    }

    virtual int onWritable(AwFD &fd)
    {
      cnt++;
      int nwritten = fd.write(data + nw, len - nw);
      if(nwritten>0)nw+=nwritten;
    }

  };

  // Make a big buffer of ABC...
  const int bufsize=1024*1024;
  char buf[bufsize];
  for( int i=0; i<bufsize; i++) buf[i]='A'+(i%26);
  buf[bufsize-1]='\n';

  // Setup the event loop
  AwPoll my_poll;
  Writer my_writer(buf, bufsize);

  // Setup the process
  string cmd("sh");
  vector<string> args;
  args.push_back(cmd);
  args.push_back("./slow.sh");
  args.push_back("linesum");
  AwProcess process(cmd, args);

  // As it's non-blocking IO we should be not be able to write all 1048576 bytes.
  my_poll.add(process.fd_stdin);
  process.fd_stdin.addListener(my_writer);
  int nwritten = process.fd_stdin.write(buf,bufsize);
  CHECK(nwritten<600000);
  my_writer.nw=nwritten;

  // Event loop - Allow 10 200ms timeouts
  for(int j=0; j<10; j=j){
    int num_events = my_poll.wait(200);
    if(num_events<1)j++; // Timeout so inc. counter
    if((my_writer.len - my_writer.nw) == 0) break; // It's done!
  }

  // Check call-back was called at least 10 times
  CHECK(my_writer.cnt>9);

  // Get the computed md5sum
  int nread = process.fd_stdout.read(buf,bufsize);
  buf[nread]='\0';
  STRCMP_CONTAINS("aa0f3ea20320211ab1b08cc65fb732e4",buf);
}
