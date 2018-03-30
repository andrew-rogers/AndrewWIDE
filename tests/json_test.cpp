#include <CppUTest/CommandLineTestRunner.h>

#include "json.h"

#include <iostream>
#include <sstream>

using namespace std;

TEST_GROUP(JsonTestGroup)
{
};

TEST(JsonTestGroup, ParseTest)
{
  istringstream in;
  in.str("{\"cmd\": \"read\"}");

  Json json;
  in >> json;

  string cmd=json["cmd"].str();
  STRCMP_EQUAL("read", cmd.c_str());
}

TEST(JsonTestGroup, AssignValueToElement)
{
  Json json;
  json["thing"]="the thing's value";

  ostringstream out;
  out << json;

  STRCMP_EQUAL("{\"thing\":\"the thing's value\"}", out.str().c_str());
}

TEST(JsonTestGroup, ShallowCopyTest)
{
  // array is not deep copied into object.
  /*
    Javascript code:
      var obj={key1: "one"};
      var arr=[];
      arr[0]="val1";
      obj["my_array"]=arr;
      arr[1]="val2";
      console.log(JSON.stringify(obj));
    Produces:
      {"key1":"one","my_array":["val1","val2"]}
  */
  Json obj;
  obj["key1"]="one";
  Json arr;
  arr[0]="val1";
  obj["my_array"]=arr;
  arr[1]="val2";

  ostringstream out;
  out << obj;

  STRCMP_EQUAL("{\"key1\":\"one\",\"my_array\":[\"val1\",\"val2\"]}", out.str().c_str());
}

TEST(JsonTestGroup, NestedObjectTest)
{
    // Test with object value as element of outer object
    /*
    Javascript code:
        var inner={key1: "one"};
        var outer={key2: "two"};
        outer["key3"]=inner;
        console.log(JSON.stringify(outer));
    Produces:
        {"key2":"two","key3":{"key1":"one"}}
    */
    Json inner;
    inner["key1"]="one";
    Json outer;
    outer["key2"]="two";
    outer["key3"]=inner;

    ostringstream out;
    out << outer;

    // Output ordering is alphabetical in C++ due to ordering in STL map. We can accept this.
    STRCMP_EQUAL("{\"key2\":\"two\",\"key3\":{\"key1\":\"one\"}}", out.str().c_str());
}

TEST(JsonTestGroup, UndefinedElementTest)
{
    // Elements with undefined values should be excluded from JSON output.
    /*
    Javascript code:
        var obj={key1: "one"};
        var undef;
        obj["key2"]=undef;
        console.log(JSON.stringify(obj));
    Produces:
        {"key1":"one"}
    */

    Json obj;
    obj["key1"]="one";
    Json undef;
    obj["key2"]=undef;

    ostringstream out;
    out << obj;

    // Output ordering is alphabetical in C++ due to ordering in STL map. We can accept this.
    STRCMP_EQUAL("{\"key1\":\"one\"}", out.str().c_str());
}

