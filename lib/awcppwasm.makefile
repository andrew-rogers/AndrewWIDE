# AW_DIR must be supplied by caller.

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

TARGET = src.js

OBJS = src.o

AWSRC_DIR=$(AW_DIR)/src
AWLIB_DIR=$(AW_DIR)/src/wasm

CXXFLAGS += -I.. -I$(AWSRC_DIR)/lib
LDFLAGS=-L$(AWLIB_DIR)

-include includes.mk

all: $(TARGET)
	
$(TARGET): $(OBJS)
	$(CXX) $(OBJS) $(LDFLAGS) -lAw -o $@ -s EXPORTED_RUNTIME_METHODS="['ccall']" -Oz --minify=0

clean:
	$(RM) $(call FixPath,$(TARGET))
	$(RM) $(call FixPath,$(OBJS))
