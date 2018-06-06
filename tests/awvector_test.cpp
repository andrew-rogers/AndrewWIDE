#include <CppUTest/CommandLineTestRunner.h>

#include "awvector.h"

#include <sstream>

using namespace std;

TEST_GROUP(AwVectorTestGroup)
{
};

TEST(AwVectorTestGroup, PushBackTest)
{
    AwVector<int> vec;
    vec.push_back(3);

    LONGS_EQUAL(1,vec.size());
}

TEST(AwVectorTestGroup, ToJsonTest)
{
    AwVector<int> vec;
    vec.push_back(3);
    Json json=vec.toJsonArray();

    ostringstream out;
    out << json;

    STRCMP_EQUAL("[3]",out.str().c_str());
}

TEST(AwVectorTestGroup, FromJsonTest)
{
    Json json;
    json[0]=2;
    json[1]=5.4;

    AwVector<int> vec;
    vec.fromJsonArray(json);

    LONGS_EQUAL(2,vec.size());
    LONGS_EQUAL(2,vec[0]);
    LONGS_EQUAL(5,vec[1]);
}

