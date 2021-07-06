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

LIB_OBJS= \
 filter.o

AWSRC_DIR=../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi

all:	libSignal.a

libSignal.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,libSignal.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

