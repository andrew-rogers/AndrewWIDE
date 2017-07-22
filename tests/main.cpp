#include <CppUTest/CommandLineTestRunner.h>

#include <vector>

using namespace std;

int main(int argc, char *argv[])
{
  vector<const char*> args(argv, argv+argc);
  args.push_back("-v"); // Add verbose flag
  return CommandLineTestRunner::RunAllTests(args.size(), &args[0]);
}
