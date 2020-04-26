OBJS= \
 $(CGI)_awmain.o

# Find all the *_aw.cpp files in func.d and produce *.o names
FUNC_OBJS=$(patsubst %.cpp,%.o,$(wildcard func.d/*_aw.cpp))

AWSRC_DIR=../../src
SIGNAL_DIR=../../lib/signal

CXXFLAGS=-I$(AWSRC_DIR)/cgi -I$(SIGNAL_DIR)
LDFLAGS=-L$(AWSRC_DIR) -L$(SIGNAL_DIR)

all:	$(CGI)

$(CGI):	$(OBJS) $(FUNC_OBJS)
	$(CXX) $^ $(LDFLAGS) -lAw -lSignal -o $@

clean:
	rm -f $(DIR)/$(CGI)
	rm -f $(OBJS)
	rm -f $(FUNC_OBJS)

