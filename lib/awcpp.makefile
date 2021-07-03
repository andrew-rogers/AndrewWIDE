# https://stackoverflow.com/questions/4058840/makefile-that-distincts-between-windows-and-unix-like-systems
# https://stackoverflow.com/questions/714100/os-detecting-makefile
ifeq '$(findstring ;,$(PATH))' ';'
    CXXFLAGS += -D WINDOWS
    RM = del /Q
    FixPath = $(subst /,\,$1)
else
    RM = rm -f
    FixPath = $1
endif

OBJS= \
 $(CGI)_awmain.o

# Find all the *_aw.cpp files in func.d and produce *.o names
FUNC_OBJS=$(patsubst %.cpp,%.o,$(wildcard func.d/*_aw.cpp))

AWSRC_DIR=../../src
SIGNAL_DIR=../../lib/signal

CXXFLAGS += -fPIC -I$(AWSRC_DIR)/cgi -I$(SIGNAL_DIR)
LDFLAGS=-L$(AWSRC_DIR) -L$(SIGNAL_DIR)

-include includes.mk

all:	$(CGI)

$(CGI):	$(OBJS) $(FUNC_OBJS)
	$(CXX) -shared -fPIC $^ $(LDFLAGS) -lAw -o $@.so

clean:
	$(RM) $(call FixPath,$(DIR)/$(CGI))
	$(RM) $(call FixPath,$(OBJS))
	$(RM) $(call FixPath,$(FUNC_OBJS))
