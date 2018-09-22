OBJS= \
 sinewave.o

AWSRC_DIR=../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi
LDFLAGS=-L$(AWSRC_DIR)

all:	$(CGI)

$(CGI):	$(OBJS)
	$(CXX) $^ $(LDFLAGS) -lAw -o $@

clean:
	rm -f $(CGI)
	rm -f $(OBJS)

