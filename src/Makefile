# https://stackoverflow.com/questions/4058840/makefile-that-distincts-between-windows-and-unix-like-systems
# https://stackoverflow.com/questions/714100/os-detecting-makefile
ifeq '$(findstring ;,$(PATH))' ';'
    CXXFLAGS += -D WINDOWS
    RM = del /Q
    MKDIR = mkdir
    FixPath = $(subst /,\,$1)
else
    RM = rm -f
    MKDIR = mkdir -p
    FixPath = $1
endif

ifeq '$(findstring emcc,$(CC))' 'emcc'
    OUTPUTS := wasm
else
    OUTPUTS := outputs
    LIB_OBJS = $(OUTPUTS)/cgi/filesystem.o
endif

CXXFLAGS += -fPIC

LIB_OBJS += \
 $(OUTPUTS)/aw_json/aw_json.o \
 $(OUTPUTS)/aw_json/awmath.o \
 $(OUTPUTS)/aw_json/json.o \
 $(OUTPUTS)/aw_json/plot.o \
 $(OUTPUTS)/aw_json/trace.o \
 $(OUTPUTS)/cgi/cgi_post.o \
 $(OUTPUTS)/utils/Debug.o \
 $(OUTPUTS)/utils/LineReader.o

all:	$(OUTPUTS) $(OUTPUTS)/libAw.a

$(OUTPUTS):
	$(MKDIR) $(call FixPath,$@)
	$(MKDIR) $(call FixPath,$@/aw_json)
	$(MKDIR) $(call FixPath,$@/cgi)
	$(MKDIR) $(call FixPath,$@/utils)

$(OUTPUTS)/%.o:%.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(OUTPUTS)/libAw.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,$(OUTPUTS)/libAw.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

