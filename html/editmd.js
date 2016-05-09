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

var Edit = function(div) {
  this.div=div;
};

Edit.prototype.save = function( fn, callback ) {
    filewrite( fn, this.div.value );
};

Edit.prototype.load = function( fn, callback ) {
  var that=this;
  fileread(fn, function(err,data){
    that.div.value=data;
  });
};

window.onload=function(e){
  var processing=false;
  var mjmd = new MathJaxMarkdownEditor();

  // Get elements
  var ta_filename=document.getElementById("ta_filename");
  var div_filelist=document.getElementById("div_filelist");
  var btn_load = document.getElementById('btn_load'); 
  var btn_save = document.getElementById('btn_save'); 
  var ta_edit=document.getElementById("ta_edit");

  var edit=new Edit(ta_edit);
  var fs=new FileSelector(div_filelist);

  // Handle Save button click
  btn_save.addEventListener('click', function() {
    edit.save(ta_filename.value);
  }, false);

  // Handle Load button click
  btn_load.addEventListener('click', function() {
    fs.show(function(fn){ // Show the file selector
      edit.load(fn);
      ta_filename.value=fn;
      mjmd.displayEditTab();
    });
  }, false);
};

var MathJaxMarkdownEditor = function() {
    this.svgarray = new SVGArray();

    // Get elements
    this.ta_edit=document.getElementById("ta_edit");
    this.div_html=document.getElementById("div_html");
    this.btn_mdhtml = document.getElementById('btn_md_html');
    this.div_downloadhtml = document.getElementById("div_downloadhtml");

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
        if(that.ta_edit.style.display=='block'){
          that.div_html.innerHTML=that.ta_edit.value;
          MathJax.Hub.Queue(["Typeset",MathJax.Hub,that.div_html]);
          MathJax.Hub.Queue(function() {
	      that.mathjaxDoneHandler();
          });
        }
        else{
            that.ta_edit.style.display='block';
            that.div_html.style.display='none';
            that.btn_mdhtml.innerHTML='View';
            that.div_downloadhtml.innerHTML="";
        }
    }, false);
};

MathJaxMarkdownEditor.prototype.displayEditTab = function() {
    this.ta_edit.style.display='block';
    this.div_html.style.display='none';
    this.btn_mdhtml.innerHTML='View';
    this.div_downloadhtml.innerHTML="";
};

MathJaxMarkdownEditor.prototype.mathjaxDoneHandler = function() {
    this.div_html.innerHTML=marked(this.div_html.innerHTML);
    this.ta_edit.style.display='none';
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
    this.svgarray.addDefs(defs);

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
  
        document.getElementById("div_downloadeqn").innerHTML=a_download;
    });
};

MathJaxMarkdownEditor.prototype.createHTML = function(){
    var html="<!DOCTYPE html>\n<html>\n<body>";

    // Get the SVG path definitions
    var defs=document.getElementById("MathJax_SVG_Hidden");
    if(defs)html+=defs.parentNode.outerHTML;

    // The main HTML and equation SVGs
    html+=this.div_html.outerHTML;

    html+="</body>\n</html>";  
    return html;
};
