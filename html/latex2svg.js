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
      var html=document.body.innerHTML;
      var fns=getEquationFileNames(html);
	    var defs=document.getElementById("MathJax_SVG_glyphs");
	    svgWriter.defs(defs.childNodes);
	    mjs=document.getElementsByClassName("MathJax_SVG");
	    for( var i=0; i<mjs.length; i++) {
        svgWriter.image(mjs[i].firstChild);
        viewer.append(svgWriter.getImage(i), fns[i]);
	console.log("5>"+fns[i]);
	    }
            
	    
    }, false);
    document.body.appendChild(div);
    document.body.appendChild(div_svg);

};

function getEquationFileNames(html)
{
    var fns=[];
    var i=0;
    do{
	i=html.indexOf('<script type="math/tex');
	if(i>0){
	    var fn="";
	    html=html.substring(i+10);
	    var j=html.indexOf('</script>(');
	    if(j>0){
		var fn1=html.substring(j+1);
		var j1=fn1.indexOf(')');
		if(j1>0){
		    fn=fn1.substring(9,j1);
		}
	    }
	    fns.push(fn);
	}
    }while(i>=0);
    return fns;
}

var SVGViewer = function(div) {
  this.div_svg=document.createElement("div");
  div.appendChild(this.div_svg);
  this.ta_source=document.createElement("textarea");
  this.ta_source.style.width="100%";
  this.ta_source.style.height="400px";
  div.appendChild(this.ta_source);
  this.div_dl=document.createElement("div");
  div.appendChild(this.div_dl);
  this.cnt=0;
};

SVGViewer.prototype.clear = function() {
  this.div_svg.innerHTML="";
  this.cnt=0;
};

SVGViewer.prototype.append = function(svg,fn) {
  var divi=document.createElement("div");
  if( this.cnt%2 )
  {
    divi.style.backgroundColor="#ccffcc";
  }
  else
  {
    divi.style.backgroundColor="#ccccff";
  }
  var blob=new Blob([svg]);
  var url = URL.createObjectURL(blob);
	var a_download = '<a href="' + url + '" download="' + fn + '">Download "' + fn + '"</a>';
  
  divi.innerHTML=svg+a_download;
  var that=this;
  divi.addEventListener( 'click', function() {
    that.displaySource(svg);
  } ,false);
  this.div_svg.appendChild(divi);
  this.cnt+=1;
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
    str=xml2str(svg,'');
    console.log(str);
    this.images.push({svg: str, uses: refs});
};

SVGFileWriter.prototype.getImage = function(index) {
    var image=this.images[index];

    // Construct the defs tag
    var uses=image.uses;
    var defstr="  <defs>"
    for( var i=0; i<uses.length; i++){
	var ref=uses[i];
	ref=ref.substring(1);
	var def=this.map[ref];
        defstr+=xml2str(def,'    ');
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

function xml2str(xml, indent)
{
  var str=indent;
  str+='<'+xml.nodeName;

  var atts=xml.attributes;
  for( var i=0; i<atts.length; i++)
  {
    var name=atts[i].name;
    if( name=='href') name='xlink:href';
    str+=' '+name+'="'+atts[i].value+'"';
  }
  str+='>';

  var closing_indent=''; // The closing tag is only indented if there are child nodes
  var c=xml.childNodes;
  for( var i=0; i<c.length; i++)
  {
    if( i==0 )str+='\n';
    str+=xml2str(c[i],indent+'  ');
    closing_indent=indent; // The parent closing tag will be on new line so indent.
  }
  str+=closing_indent+'</'+xml.nodeName+'>\n';

  return str;
}
