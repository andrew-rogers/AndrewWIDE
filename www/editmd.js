/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2016  Andrew Rogers
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

var MathJaxMarkdownEditor = function(div) {
    if(div){
        this.div=div;
    } else{
        this.div=document.createElement("div");
        document.body.appendChild(this.div);
    }

    // Create elements
    this.div_md=document.createElement("div");
    this.div.appendChild(this.div_md);
    this.div_html=document.createElement("div");
    this.div.appendChild(this.div_html);
    this.btn_mdhtml=document.createElement("button");
    this.div.appendChild(this.btn_mdhtml);
    this.div_downloadhtml=document.createElement("div");
    this.div.appendChild(this.div_downloadhtml);
    this.div_downloadeqn=document.createElement("div");
    this.div.appendChild(this.div_downloadeqn);

    this.svgarray = new SVGArray();
    this.edit = new Editor(this.div_md);

    this.displayEditTab();

    MathJax.Hub.Config({
        tex2jax: {
            inlineMath: [["$","$"],["\\(","\\)"]],
            processEscapes: true
        },
        jax: ["input/TeX","output/SVG"]
    });

    // Handle MD / HTML button click
    var that=this;
    this.btn_mdhtml.addEventListener('click', function() {
        if(that.div_md.style.display=='block'){
          that.div_html.innerHTML=that.edit.getText();
          MathJax.Hub.Queue(["Typeset",MathJax.Hub,that.div_html]);
          MathJax.Hub.Queue(function() {
	      that.mathjaxDoneHandler();
          });
        }
        else{
            that.div_md.style.display='block';
            that.div_html.style.display='none';
            that.btn_mdhtml.innerHTML='View';
            that.div_downloadhtml.innerHTML="";
        }
    }, false);
};

MathJaxMarkdownEditor.prototype.displayEditTab = function() {
    this.div_md.style.display='block';
    this.div_html.style.display='none';
    this.btn_mdhtml.innerHTML='View';
    this.div_downloadhtml.innerHTML="";
};

MathJaxMarkdownEditor.prototype.mathjaxDoneHandler = function() {

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

    this.div_md.style.display='none';
    this.div_html.style.display='block';
    this.btn_mdhtml.innerHTML='Edit';

    this.processMathJaxOutput();

    var html = this.createHTML();
    var blob=new Blob([html],{type: "text/html"});
    var url = URL.createObjectURL(blob);
    var fn="MJMD_out.html";
    var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';
    this.div_downloadhtml.innerHTML=a_download;
};

MathJaxMarkdownEditor.prototype.processMathJaxOutput = function() {
    // Get the SVG path definitions
    var defs=document.getElementById("MathJax_SVG_glyphs");
    this.svgarray.clear();
    if(defs)this.svgarray.addDefs(defs);

    // Remove MathML stuff
    var mjs=this.div_html.getElementsByClassName("MathJax_SVG");
    for(var i=0; i<mjs.length; i++){
        this.addClickHandler(mjs, i);
        var svg = mjs[i].getElementsByTagName("svg")[0];
        this.svgarray.addImage(svg);
        var span = mjs[i].getElementsByTagName("math")[0].parentNode;
        span.parentNode.removeChild(span);
    }
};

MathJaxMarkdownEditor.prototype.addClickHandler = function(elems, index){
    var that=this;
    elems[index].addEventListener("click", function(e) {
        for(var i=0; i<elems.length; i++) elems[i].style.backgroundColor="";
        elems[index].style.backgroundColor="#ccccff"

        var blob=new Blob([that.svgarray.getImageIncDefs(index)]);
        var url = URL.createObjectURL(blob);
        var fn = "equation.svg"
        var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';
  
        //document.getElementById("div_downloadeqn").innerHTML=a_download;
        that.div_downloadeqn.innerHTML = a_download;
    });
};

MathJaxMarkdownEditor.prototype.createHTML = function(){
    var html="<!DOCTYPE html>\n<html>\n<head><meta charset=\"UTF-8\"></head>\n<body>";

    // Get the SVG path definitions
    var defs=document.getElementById("MathJax_SVG_Hidden");
    if(defs)html+=defs.parentNode.outerHTML;

    // The main HTML and equation SVGs
    html+=this.div_html.outerHTML;

    html+="</body>\n</html>";  
    return html;
};
