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
    OUTPUTS := ../wasm
    LIB_OBJS = $(OUTPUTS)/biquad.o
    LIB_OBJS += $(OUTPUTS)/fft.o
    LIB_OBJS += $(OUTPUTS)/kiss_fft.o
    LIB_OBJS += $(OUTPUTS)/xcorr.o
    CXXFLAGS += -I../../../kissfft -I ../lib
else
    OUTPUTS := ../outputs
endif

CXXFLAGS += -fPIC

all:	$(OUTPUTS) $(OUTPUTS)/libsignal.a

$(OUTPUTS):
	$(MKDIR) $(call FixPath,$@)
	$(MKDIR) $(call FixPath,$@/aw_json)
	$(MKDIR) $(call FixPath,$@/cgi)
	$(MKDIR) $(call FixPath,$@/utils)
	$(MKDIR) $(call FixPath,$@/lib)
	
$(OUTPUTS)/kiss_fft.o: ../../../kissfft/kiss_fft.c
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(OUTPUTS)/%.o:%.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(OUTPUTS)/libsignal.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,$(OUTPUTS)/libsignal.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

