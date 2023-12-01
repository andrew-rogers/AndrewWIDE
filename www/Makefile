# https://stackoverflow.com/questions/4058840/makefile-that-distincts-between-windows-and-unix-like-systems
# https://stackoverflow.com/questions/714100/os-detecting-makefile
ifeq '$(findstring ;,$(PATH))' ';'
    CAT = type
    FixPath = $(subst /,\,$1)
    RM = del /Q
else
    CAT = cat
    FixPath = $1
    RM = rm -f
endif

# AwDocViewer Must be first, it has the AsyncLoader.
SRCS = AwDocViewer.js \
 AwCppRenderer.js \
 AwCppWasmRenderer.js \
 DOTRenderer.js \
 DSPInterfaces.js \
 Diagram/Geometry.js \
 Diagram/Plot/Plot.js \
 Diagram/Shapes/SignalProcessing.js \
 Diagram/SvgFigure.js \
 DiagramRenderer.js \
 FileSystem.js \
 JavaScriptRenderer.js \
 JsonQuery.js \
 NavBar.js \
 PrintRenderer.js \
 PythonRenderer.js \
 WasmRuntime.js \
 WasmVectors.js \
 XML.js \
 file.js \
 fileselector.js \
 jsonarraybuffers.js \
 menu.js \
 svgarray.js

AndrewWIDE.js: $(SRCS)
	$(CAT) $(call FixPath,$^) > $@

clean:
	$(RM) AndrewWIDE.js

