#include <CppUTest/CommandLineTestRunner.h>
#include "awprocess.h"

#include <iostream>

using namespace std;

TEST_GROUP(ProcessTestGroup)
{
};

TEST(ProcessTestGroup, FirstTest)
{
  string cmd("printf");
  vector<string> args;
  args.push_back(cmd);
  args.push_back("0x40=%d");
  args.push_back("0x40");
  AwProcess process(cmd, args);

  char buf[1024];
  int nread=::read(process.stdout, buf, 1023);
  buf[nread]='\0';

  STRCMP_EQUAL("0x40=64", buf);

}
