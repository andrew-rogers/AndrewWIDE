/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2020  Andrew Rogers
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
 
// Dependencies:
//   https://github.com/mathjax/MathJax/archive/2.7.8.zip
//   https://github.com/markedjs/marked/raw/master/lib/marked.js

var MathJaxMarkdownRenderer = function() {
    this.svgarray = new SVGArray();

    this.div_html=null; // Stores the div for the output

    MathJax.Hub.Config({
        tex2jax: {
            inlineMath: [["$","$"],["\\(","\\)"]],
            processEscapes: true
        },
        jax: ["input/TeX","output/SVG"]
    });
    
};

MathJaxMarkdownRenderer.prototype.render = function(mjmd, div, callback) {
    this.div_html = div;
    this.div_html.innerHTML=mjmd; // MathJax processes in-place so copy the input markdown into the div.
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.div_html]);
    var that=this;
    MathJax.Hub.Queue(function() {
        that._mathjaxDoneHandler(callback);
    });
};

MathJaxMarkdownRenderer.prototype._mathjaxDoneHandler = function(callback) {

    // --- Handle code sections without '>' displaying as '&gt;' ---
    // https://github.com/chjj/marked/issues/160#issuecomment-18611040

    // Let marked do its normal token generation.
    var tokens = marked.lexer( this.div_html.innerHTML );

    // Mark all code blocks as already being escaped.
    // This prevents the parser from encoding anything inside code blocks
    tokens.forEach(function( token ) {
        if ( token.type === "code" ) {
            token.escaped = true;
        }
    });

    // Let marked do its normal parsing, but without encoding the code blocks
    this.div_html.innerHTML = marked.parser( tokens );
    // -------------------------------------------------------------

    

    this._processMathJaxOutput();

    callback();
};

MathJaxMarkdownRenderer.prototype._processMathJaxOutput = function() {
    // Get the SVG path definitions
    var defs=document.getElementById("MathJax_SVG_glyphs");
    this.svgarray.clear();
    if(defs)this.svgarray.addDefs(defs);

    // Remove MathML stuff
    var mjs=this.div_html.getElementsByClassName("MathJax_SVG");
    for(var i=0; i<mjs.length; i++){
        this._addClickHandler(mjs, i);
        var svg = mjs[i].getElementsByTagName("svg")[0];
        this.svgarray.addImage(svg);
        var span = mjs[i].getElementsByTagName("math")[0].parentNode;
        span.parentNode.removeChild(span);
    }
};

MathJaxMarkdownRenderer.prototype._addClickHandler = function(elems, index){
    var that=this;
    elems[index].addEventListener("click", function(e) {
        for(var i=0; i<elems.length; i++) elems[i].style.backgroundColor="";
        elems[index].style.backgroundColor="#ccccff"

	var blob=new Blob([that.svgarray.getImageIncDefs(index)]);
        var url = URL.createObjectURL(blob);
        var fn = "equation.svg"
	var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';
  
        document.getElementById("div_downloadeqn").innerHTML=a_download;
    });
};

