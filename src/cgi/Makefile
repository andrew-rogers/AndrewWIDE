
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

JSON_DIR=../aw_json

CGI_DIR=../../www/cgi-bin
CGIS=$(CGI_DIR)/awcpp.cgi $(CGI_DIR)/filesystem.cgi

all: $(CGIS)

$(CGI_DIR)/awcpp.cgi: awcpp_cgi.cpp $(JSON_DIR)/json.cpp filesystem.cpp cgi_post.cpp
	g++ $(CXXFLAGS) $^ $(LDFLAGS) -o $@

$(CGI_DIR)/filesystem.cgi: filesystem_cgi.cpp $(JSON_DIR)/json.cpp filesystem.cpp cgi_post.cpp
	g++ $(CXXFLAGS) $^ -o $@

clean:
	$(RM) $(call FixPath,$(CGIS))

