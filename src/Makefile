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
    LIB_OBJS = $(OUTPUTS)/lib/Json.o
    LIB_OBJS += $(OUTPUTS)/lib/PlotGenerator.o
    LIB_OBJS += $(OUTPUTS)/lib/PrintGenerator.o
    LIB_OBJS += $(OUTPUTS)/lib/WasmVectors.o
    LIB_OBJS += $(OUTPUTS)/lib/vecmath.o
    LIB_OBJS += $(OUTPUTS)/lib/wasm_buffers.o
else
    OUTPUTS := outputs
    LIB_OBJS = $(OUTPUTS)/cgi/filesystem.o
    LIB_OBJS += $(OUTPUTS)/cgi/cgi_post.o
    LIB_OBJS += $(OUTPUTS)/aw_json/aw_json.o
    LIB_OBJS += $(OUTPUTS)/aw_json/awmath.o
    LIB_OBJS += $(OUTPUTS)/aw_json/json.o
    LIB_OBJS += $(OUTPUTS)/aw_json/plot.o
    LIB_OBJS += $(OUTPUTS)/aw_json/trace.o
    LIB_OBJS += $(OUTPUTS)/utils/Debug.o
    LIB_OBJS += $(OUTPUTS)/utils/LineReader.o
endif

CXXFLAGS += -fPIC

LIB_OBJS += \
 $(OUTPUTS)/lib/Buffers.o \
 $(OUTPUTS)/lib/NamedValues.o \
 $(OUTPUTS)/lib/StringReader.o

all:	$(OUTPUTS) $(OUTPUTS)/libAw.a

$(OUTPUTS):
	$(MKDIR) $(call FixPath,$@)
	$(MKDIR) $(call FixPath,$@/aw_json)
	$(MKDIR) $(call FixPath,$@/cgi)
	$(MKDIR) $(call FixPath,$@/utils)
	$(MKDIR) $(call FixPath,$@/lib)

$(OUTPUTS)/%.o:%.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(OUTPUTS)/libAw.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,$(OUTPUTS)/libAw.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

