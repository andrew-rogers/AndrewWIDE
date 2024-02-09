MODULE = thing
#DOCS = $(wildcard *.awdoc)
DOCS = Arrays.awdoc biquad.awdoc

AW_DIR ?= ..
OUTPUT = $(MODULE).awtmp
CPPS = $(patsubst %.awdoc,$(OUTPUT)/%.cpp,$(DOCS))
HTMLS = $(patsubst %.awdoc,$(OUTPUT)/%.html,$(DOCS))
OBJS = $(patsubst %.awdoc,$(OUTPUT)/%.o,$(DOCS))
WASM = $(OUTPUT)/$(MODULE).wasm
WASMMJS = $(OUTPUT)/$(MODULE).mjs

CXXFLAGS += -I $(AW_DIR)/src/lib
LDFLAGS = -L $(AW_DIR)/src/wasm --no-entry

AW2CPP = $(EMSDK_NODE) $(AW_DIR)/tools/aw2cpp.mjs

.PRECIOUS: $(CPPS) $(OBJS) # Stops make deleting intermediate files

.PHONY: all dirs
all: dirs $(WASM) $(HTMLS)

dirs:
	mkdir -p $(OUTPUT)

$(OUTPUT)/%.cpp: %.awdoc
	#echo $< $@ $(patsubst %.awdoc,%,$<)
	$(AW2CPP) $< $@ $(patsubst %.awdoc,%,$<)

$(OUTPUT)/%.html: %.awdoc
	echo $< $@ $(patsubst %.awdoc,%,$<) $(WASMMJS)

$(WASM): $(OBJS)
	$(CXX) $(OBJS) $(LDFLAGS) -lAw -o $@ -Oz
