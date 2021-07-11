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

CXXFLAGS += -fPIC

LIB_OBJS= \
 aw_json/aw_json.o \
 aw_json/json.o \
 cgi/filesystem.o \
 cgi/cgi_post.o \
 cgi/awmath.o \
 cgi/plot.o \
 cgi/trace.o

AWF_OBJS= \
 aw_framework/awapp.o \
 aw_framework/awfd.o \
 aw_framework/awfdobserver.o \
 aw_framework/awobserver.o \
 aw_framework/awpoll.o \
 aw_framework/awserver.o \
 aw_framework/awsocket.o \
 aw_framework/awsubject.o

all:	libAw.a

libAw.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,libAw.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

