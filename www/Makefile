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

SRCS = AwCppRenderer.js \
 AwCppWasmRenderer.js \
 AwDocRenderer.js \
 Diagram/Geometry.js \
 Diagram/Plot/Plot.js \
 Diagram/Shapes/SignalProcessing.js \
 Diagram/SvgFigure.js \
 DiagramRenderer.js \
 FileSystem.js \
 JsonQuery.js \
 MathJaxMarkdownRenderer.js \
 NavBar.js \
 PlotRenderer.js \
 XML.js \
 file.js \
 fileselector.js \
 jsonarraybuffers.js \
 menu.js \
 svgarray.js

AwAll.js: $(SRCS)
	$(CAT) $(call FixPath,$^) > $@

clean:
	$(RM) AwAll.js

