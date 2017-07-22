TEST_OBJS= \
 main.o \
 awapp_test.o 


OBJ_DIR=../src/aw_framework
OBJS= \
 $(OBJ_DIR)/awapp.o

CPPUTEST=../src/third_party/cpputest-master
CPPUTEST_OBJS= \
 $(CPPUTEST)/src/CppUTest/Utest.o \
 $(CPPUTEST)/src/CppUTest/TestFailure.o \
 $(CPPUTEST)/src/CppUTest/SimpleString.o \
 $(CPPUTEST)/src/CppUTest/CommandLineTestRunner.o \
 $(CPPUTEST)/src/CppUTest/CommandLineArguments.o \
 $(CPPUTEST)/src/CppUTest/TestResult.o \
 $(CPPUTEST)/src/CppUTest/TestFilter.o \
 $(CPPUTEST)/src/CppUTest/TestRegistry.o \
 $(CPPUTEST)/src/CppUTest/TestPlugin.o \
 $(CPPUTEST)/src/CppUTest/TestOutput.o \
 $(CPPUTEST)/src/CppUTest/MemoryLeakWarningPlugin.o \
 $(CPPUTEST)/src/CppUTest/MemoryLeakDetector.o \
 $(CPPUTEST)/src/CppUTest/SimpleMutex.o \
 $(CPPUTEST)/src/CppUTest/TestMemoryAllocator.o \
 $(CPPUTEST)/src/CppUTest/TeamCityTestOutput.o \
 $(CPPUTEST)/src/CppUTest/JUnitTestOutput.o \
 $(CPPUTEST)/src/Platforms/Gcc/UtestPlatform.o

CXXFLAGS=-I$(CPPUTEST)/include -I$(OBJ_DIR)
LDFLAGS=-L$(CPPUTEST)

all:	$(CPPUTEST)/libCppUTest.a tests

tests:	$(TEST_OBJS) $(OBJS)
	$(CXX) $^ $(LDFLAGS) -lCppUTest -o $@

$(CPPUTEST)/libCppUTest.a: $(CPPUTEST_OBJS)
	$(AR) rvs $@ $^

clean:
	rm -f tests
	rm -f $(TEST_OBJS)
