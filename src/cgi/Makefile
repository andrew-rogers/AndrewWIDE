
CGI_DIR=../../www/cgi-bin
CGIS=$(CGI_DIR)/post2hex.cgi $(CGI_DIR)/aw_fs.cgi

all: $(CGIS)

$(CGI_DIR)/post2hex.cgi: post2hex.cpp
	g++ $^ -o $@

$(CGI_DIR)/aw_fs.cgi: aw_fs_cgi.cpp json.cpp filesystem.cpp
	g++ $^ -o $@

clean:
	rm -f $(CGIS)

