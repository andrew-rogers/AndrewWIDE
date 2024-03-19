# AW_DIR, DOCS, MODULE & WASMDSP_DIR variable must be defined by user

OUTPUT = $(MODULE).awtmp
STATIC ?= $(OUTPUT)
CPPS = $(patsubst %.awdoc,$(OUTPUT)/%.cpp,$(DOCS))
HTMLS = $(patsubst %.awdoc,$(STATIC)/%.html,$(DOCS))
OBJS = $(patsubst %.awdoc,$(OUTPUT)/%.o,$(DOCS))
WASM = $(OUTPUT)/$(MODULE).wasm
WASMMJS = $(OUTPUT)/$(MODULE).mjs
WASMJS = $(STATIC)/$(MODULE).js

CXXFLAGS += -I $(WASMDSP_DIR)/lib/WasmDSP
LDFLAGS += -L $(WASMDSP_DIR)/lib/WasmDSP -lWasmDSP --no-entry

AW2CPP = $(EMSDK_NODE) $(AW_DIR)/tools/aw2cpp.mjs
AW2HTML = $(EMSDK_NODE) $(AW_DIR)/tools/aw2html.mjs
WASM2MJS = $(EMSDK_NODE) $(WASMDSP_DIR)/tools/wasm2mjs.mjs

.PRECIOUS: $(CPPS) $(OBJS) # Stops make deleting intermediate files

.PHONY: all dirs
all: dirs $(WASMJS) $(HTMLS)

dirs:
	mkdir -p $(OUTPUT)

$(OUTPUT)/%.cpp: %.awdoc
	$(AW2CPP) $< $@ $(patsubst %.awdoc,%,$<)

$(STATIC)/%.html: %.awdoc
	$(AW2HTML) $< $@ $(patsubst %.awdoc,%,$<) $(WASMJS)

$(WASM): $(OBJS)
	$(CXX) $(OBJS) $(LDFLAGS) -o $@ -Oz

$(WASMMJS): $(WASM)
	$(WASM2MJS) $< $@

$(WASMJS): $(WASMMJS)
	rollup --format=amd --file=$@ -- $<
