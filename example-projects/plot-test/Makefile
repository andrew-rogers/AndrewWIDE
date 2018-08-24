OBJS= \
 sinewave.o

AWSRC_DIR=../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi
LDFLAGS=-L$(AWSRC_DIR)

all:	sinewave

sinewave:	$(OBJS)
	$(CXX) $^ $(LDFLAGS) -lAw -o $@

clean:
	rm -f sinewave
	rm -f $(OBJS)

