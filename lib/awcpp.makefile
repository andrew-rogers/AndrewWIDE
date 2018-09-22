OBJS= \
 $(CGI)_awmain.o

# Find all the *_aw.cpp files in func.d and produce *.o names
FUNC_OBJS=$(patsubst %.cpp,%.o,$(wildcard func.d/*_aw.cpp))

AWSRC_DIR=../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi
LDFLAGS=-L$(AWSRC_DIR)

all:	$(CGI)

$(CGI):	$(OBJS) $(FUNC_OBJS)
	$(CXX) $^ $(LDFLAGS) -lAw -o $@

clean:
	rm -f $(DIR)/$(CGI)
	rm -f $(OBJS)
	rm -f $(FUNC_OBJS)

