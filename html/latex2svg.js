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

window.onload = function(e)
{
    MathJax.Hub.Config({
      tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
    });

    var div=document.createElement("div");
    var div_svg=document.createElement("div");

    div.innerHTML="Display SVG";

    var svgWriter = new SVGFileWriter;
    var viewer = new SVGViewer(div_svg);

    div.addEventListener('click', function() {
      viewer.clear();
	    var defs=document.getElementById("MathJax_SVG_glyphs");
	    svgWriter.defs(defs.childNodes);
	    mjs=document.getElementsByClassName("MathJax_SVG");
	    for( var i=0; i<mjs.length; i++) {
        svgWriter.image(mjs[i].firstChild);
        viewer.append(svgWriter.getImage(i));
	    }
    }, false);
    document.body.appendChild(div);
    document.body.appendChild(div_svg);

};

var SVGViewer = function(div) {
  this.div_svg=document.createElement("div");
  div.appendChild(this.div_svg);
  this.ta_source=document.createElement("textarea");
  this.ta_source.style.width="100%";
  this.ta_source.style.height="400px";
  div.appendChild(this.ta_source);
  this.div_dl=document.createElement("div");
  div.appendChild(this.div_dl);
};

SVGViewer.prototype.clear = function() {
  this.div_svg.innerHTML="";
};

SVGViewer.prototype.append = function(svg) {
  var divi=document.createElement("div");
  var blob=new Blob([svg]);
  var url = URL.createObjectURL(blob);
	var a_download = '<a href="' + url + '" download="equation.svg">Download</a>';
  
  divi.innerHTML=svg+a_download;
  var that=this;
  divi.addEventListener( 'click', function() {
    that.displaySource(svg);
  } ,false);
  this.div_svg.appendChild(divi);
};

SVGViewer.prototype.displaySource = function(svg) {
  this.ta_source.value=svg;
};

var SVGFileWriter = function () {
    this.jszip=null;
    if(typeof JSZip !== 'undefined') {
      this.jszip=new JSZip;
    }
    this.map={};
    this.images=[];
};

SVGFileWriter.prototype.defs = function(defs) {
    for( var i=0; i<defs.length; i++ ) {
	this.map[defs[i].getAttribute("id")]=defs[i];
    }
    console.log(this.map);
};

SVGFileWriter.prototype.image = function(svg) {
    console.log(svg);
    var uses=svg.getElementsByTagName("use");
    var refs=[];
    for( var i=0; i<uses.length; i++) {
	refs.push(uses[i].getAttribute("href"))
    }
    str=(new XMLSerializer).serializeToString(svg);
    this.images.push({svg: str, uses: refs});
};

SVGFileWriter.prototype.getImage = function(index) {
    var image=this.images[index];

    // Construct the defs tag
    var uses=image.uses;
    var defstr="  <defs>\n"
    for( var i=0; i<uses.length; i++){
	var ref=uses[i];
	ref=ref.substring(1);
	var def=this.map[ref];
	def=(new XMLSerializer).serializeToString(def);
	defstr+="    "+def+"\n";
    }
    defstr+="  </defs>\n";

    // Split SVG
    var i=image.svg.indexOf(">")+1; // End of opening svg tag
    var svgtag=image.svg.substring(0,i);
    var svg=image.svg.substring(i);

    svgtag=svgtag.replace(/<svg/,'<svg xmlns="http://www.w3.org/2000/svg"');

    // Insert defs just after SVG tag
    var svgstr=svgtag+"\n"+defstr+svg;

    console.log(svgstr);
    return svgstr;
};

