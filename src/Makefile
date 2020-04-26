LIB_OBJS= \
 cgi/json.o \
 cgi/filesystem.o \
 cgi/cgi_post.o \
 cgi/awmath.o \
 cgi/plot.o \
 cgi/trace.o \
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
	rm -f libAw.a
	rm -f $(LIB_OBJS)

