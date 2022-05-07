# CGI and AW_DIR must be supplied by caller.

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

# Set OBJS if globals.cpp exists.
OBJS=$(patsubst %.cpp,%.o,$(wildcard globals.cpp))

# Find all the *_aw.cpp files in func.d and produce *.o names
FUNC_OBJS=$(patsubst %.cpp,%.o,$(wildcard func.d/*_aw.cpp))

AWSRC_DIR=$(AW_DIR)/src
AWLIB_DIR=$(AW_DIR)/src/outputs
SIGNAL_DIR=$(AW_DIR)/lib/signal

CXXFLAGS += -fPIC -I.. -I$(AWSRC_DIR)/aw_json -I$(SIGNAL_DIR)
LDFLAGS=-L$(AWLIB_DIR) -L$(SIGNAL_DIR)

SO=$(CGI).so

-include includes.mk

all:	$(SO)

$(SO):	$(OBJS) $(FUNC_OBJS)
	$(CXX) -shared -fPIC $^ $(LDFLAGS) -lAw -o $@

clean:
	$(RM) $(call FixPath,$(SO))
	$(RM) $(call FixPath,$(OBJS))
	$(RM) $(call FixPath,$(FUNC_OBJS))
