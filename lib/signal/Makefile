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

LIB_OBJS= \
 $(OUTPUTS)/filter.o

AWSRC_DIR=../../src

CXXFLAGS=-I$(AWSRC_DIR)/cgi

all:	$(OUTPUTS) $(OUTPUTS)/libSignal.a

$(OUTPUTS):
	mkdir -p $(OUTPUTS)

$(OUTPUTS)/%.o:%.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(OUTPUTS)/libSignal.a: $(LIB_OBJS)
	$(AR) rvs $@ $^

clean:
	$(RM) $(call FixPath,$(OUTPUTS)/libSignal.a)
	$(RM) $(call FixPath,$(LIB_OBJS))

