TEST_OBJS= \
 main.o \
 awapp_test.o \
 awprocess_test.o \
 awobserver_test.o \
 json_test.o \
 awvector_test.o

OBJ_DIR=../src/aw_framework
AWF_OBJS= \
 $(OBJ_DIR)/awapp.o \
 $(OBJ_DIR)/awprocess.o \
 $(OBJ_DIR)/awpoll.o \
 $(OBJ_DIR)/awfd.o \
 $(OBJ_DIR)/awsubject.o \
 $(OBJ_DIR)/awobserver.o \
 $(OBJ_DIR)/awfdobserver.o

CGI_DIR=../src/cgi
CGI_OBJS= \
 $(CGI_DIR)/json.o

OBJS=$(AWF_OBJS) $(CGI_OBJS)

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

CXXFLAGS=-I$(CPPUTEST)/include -I$(OBJ_DIR) -I$(CGI_DIR) -include NewMacros.h
LDFLAGS=-L$(CPPUTEST)

all:	$(CPPUTEST)/libCppUTest.a tests

tests:	$(TEST_OBJS) $(OBJS)
	$(CXX) $^ $(LDFLAGS) -lCppUTest -o $@

$(CPPUTEST)/libCppUTest.a: $(CPPUTEST_OBJS)
	$(AR) rvs $@ $^

clean:
	rm -f tests
	rm -f $(TEST_OBJS)
