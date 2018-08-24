LIB_OBJS= \
 cgi/json.o \
 cgi/filesystem.o

all:	libAw.a

libAw.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	rm -f libAw.a
	rm -f $(LIB_OBJS)

