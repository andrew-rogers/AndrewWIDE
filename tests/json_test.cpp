#include <CppUTest/CommandLineTestRunner.h>

#include "json.h"

#include <iostream>
#include <sstream>

using namespace std;

TEST_GROUP(JsonTestGroup)
{
};

TEST(JsonTestGroup, FirstTest)
{
  Json json;
  istringstream in;
  in.str("{\"cmd\": \"read\"}");
  in >> json;
  string cmd=json["cmd"].str();
  STRCMP_EQUAL("read", cmd.c_str());
}

