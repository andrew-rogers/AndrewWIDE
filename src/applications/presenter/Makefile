
AWSRC_DIR=../../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi -I$(AWSRC_DIR)/aw_framework
LDFLAGS=-L$(AWSRC_DIR)

all:	presenter presenter.cgi

presenter:	presenter.o
	$(CXX) $^ $(LDFLAGS) -lAw -o $@

presenter.cgi:	presenter_cgi.o
	$(CXX) $^ $(LDFLAGS) -lAw -o $@

clean:
	rm -f presenter.o presenter_cgi.o
	rm -f presenter presenter.cgi

