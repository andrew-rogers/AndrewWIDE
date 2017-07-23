#include <CppUTest/CommandLineTestRunner.h>
#include "awapp.h"

#include <string>

using namespace std;

TEST_GROUP(AppTestGroup)
{
};

TEST(AppTestGroup, FirstTest)
{
  vector<char*> args;
  string arg("./thing");
  args.push_back(&arg[0]);
  int argc=args.size();
  char **argv=&args[0];
  AwApp app( argc, argv );
  CHECK_EQUAL( 1, app.getArgs().size());
  STRCMP_EQUAL("./thing", app.getArgs()[0]);
  
  arg[6]='k';
  STRCMP_EQUAL("./think", app.getArgs()[0]);

  string arg1("big");
  args.push_back(&arg1[0]);
  argc=args.size();
  argv=&args[0];
  AwApp app1( argc, argv );
  CHECK_EQUAL( 2, app1.getArgs().size());
  STRCMP_EQUAL("./think", app1.getArgs()[0]);
  STRCMP_EQUAL("big", app1.getArgs()[1]);
}
