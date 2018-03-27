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

TEST(JsonTestGroup, SecondTest)
{
  Json json;
  json["thing"]="the thing's value";
  ostringstream out;
  out << json;
  STRCMP_EQUAL("{\"thing\":\"the thing's value\"}", out.str().c_str());
}

