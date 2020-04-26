LIB_OBJS= \
 filter.o
 
AWSRC_DIR=../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi

all:	libSignal.a

libSignal.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	rm -f libSignal.a
	rm -f $(LIB_OBJS)

