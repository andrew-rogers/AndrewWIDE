
# https://stackoverflow.com/questions/4058840/makefile-that-distincts-between-windows-and-unix-like-systems
# https://stackoverflow.com/questions/714100/os-detecting-makefile
ifeq '$(findstring ;,$(PATH))' ';'
    CXXFLAGS += -D WINDOWS
    RM = del /Q
    FixPath = $(subst /,\,$1)
else
    RM = rm -f
    FixPath = $1
    LDFLAGS += -ldl
endif


CGI_DIR=../../www/cgi-bin
CGIS=$(CGI_DIR)/post2hex.cgi $(CGI_DIR)/aw_fs.cgi $(CGI_DIR)/awcpp.cgi $(CGI_DIR)/filesystem.cgi

all: $(CGIS)

$(CGI_DIR)/post2hex.cgi: post2hex.cpp
	g++ $(CXXFLAGS) $^ -o $@

$(CGI_DIR)/aw_fs.cgi: aw_fs_cgi.cpp json.cpp filesystem.cpp
	g++ $(CXXFLAGS) $^ -o $@

$(CGI_DIR)/awcpp.cgi: awcpp_cgi.cpp json.cpp filesystem.cpp cgi_post.cpp
	g++ $(CXXFLAGS) $^ $(LDFLAGS) -o $@

$(CGI_DIR)/filesystem.cgi: filesystem_cgi.cpp json.cpp filesystem.cpp cgi_post.cpp
	g++ $(CXXFLAGS) $^ -o $@

clean:
	$(RM) $(call FixPath,$(CGIS))

