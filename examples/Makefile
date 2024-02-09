MODULE = thing
#DOCS = $(wildcard *.awdoc)
DOCS = Arrays.awdoc biquad.awdoc

AW_DIR ?= ..
WASMDSP_DIR ?= ../../WasmDSP
OUTPUT = $(MODULE).awtmp
CPPS = $(patsubst %.awdoc,$(OUTPUT)/%.cpp,$(DOCS))
HTMLS = $(patsubst %.awdoc,$(OUTPUT)/%.html,$(DOCS))
OBJS = $(patsubst %.awdoc,$(OUTPUT)/%.o,$(DOCS))
WASM = $(OUTPUT)/$(MODULE).wasm
WASMMJS = $(OUTPUT)/$(MODULE).mjs

CXXFLAGS += -I $(AW_DIR)/src/lib
LDFLAGS = -L $(AW_DIR)/src/wasm --no-entry

AW2CPP = $(EMSDK_NODE) $(AW_DIR)/tools/aw2cpp.mjs
AW2HTML = $(EMSDK_NODE) $(AW_DIR)/tools/aw2html.mjs
WASM2MJS = $(EMSDK_NODE) $(WASMDSP_DIR)/tools/wasm2mjs.mjs

.PRECIOUS: $(CPPS) $(OBJS) # Stops make deleting intermediate files

.PHONY: all dirs
all: dirs $(WASMMJS) $(HTMLS)

dirs:
	mkdir -p $(OUTPUT)

$(OUTPUT)/%.cpp: %.awdoc
	$(AW2CPP) $< $@ $(patsubst %.awdoc,%,$<)

$(OUTPUT)/%.html: %.awdoc
	$(AW2HTML) $< $@ $(patsubst %.awdoc,%,$<) $(WASMMJS)

$(WASM): $(OBJS)
	$(CXX) $(OBJS) $(LDFLAGS) -lAw -o $@ -Oz

$(WASMMJS): $(WASM)
	$(WASM2MJS) $< $@

