#include <CppUTest/CommandLineTestRunner.h>
#include "awprocess.h"

#include <iostream>
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
