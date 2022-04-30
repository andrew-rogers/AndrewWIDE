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

OUTPUTS := outputs

CXXFLAGS += -fPIC

LIB_OBJS= \
 $(OUTPUTS)/aw_json/aw_json.o \
 $(OUTPUTS)/aw_json/json.o \
 $(OUTPUTS)/cgi/filesystem.o \
 $(OUTPUTS)/cgi/cgi_post.o \
 $(OUTPUTS)/cgi/awmath.o \
 $(OUTPUTS)/cgi/plot.o \
 $(OUTPUTS)/cgi/trace.o

all:	$(OUTPUTS) $(OUTPUTS)/libAw.a

$(OUTPUTS):
	mkdir -p $(OUTPUTS)/aw_json
	mkdir -p $(OUTPUTS)/cgi

$(OUTPUTS)/%.o:%.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(OUTPUTS)/libAw.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,$(OUTPUTS)/libAw.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

