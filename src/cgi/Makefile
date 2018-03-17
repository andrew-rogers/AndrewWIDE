
CGI_DIR=../../html/cgi-bin
CGIS= $(CGI_DIR)/post2hex.cgi

all: $(CGIS)

$(CGI_DIR)/post2hex.cgi: post2hex.cpp
	g++ $^ -o $@

clean:
	rm -f $(CGIS)

