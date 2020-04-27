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

var SVGArray = function () {
    this.jszip=null;
    if(typeof JSZip !== 'undefined') {
      this.jszip=new JSZip;
    }
    this.map_refs={};
    this.images=[];
};

SVGArray.prototype.addDefs = function(defs) {
    defs = defs.childNodes;
    for( var i=0; i<defs.length; i++ ) {
	this.map_refs[defs[i].getAttribute("id")]=defs[i];
    }
};

SVGArray.prototype.addImage = function(svg) {
    var uses=svg.getElementsByTagName("use");
    var refs=[];
    for( var i=0; i<uses.length; i++) {
        var href = uses[i].getAttribute("href");
	if(href==null) href = uses[i].getAttribute("xlink:href");
	refs.push(href)
    }
    str=this.xml2str(svg,'');
    this.images.push({svg: str, uses: refs});
};

SVGArray.prototype.getImageIncDefs = function(index) {
    var image=this.images[index];

    // Construct the defs tag
    var uses=image.uses;
    var defstr="  <defs>\n"
    for( var i=0; i<uses.length; i++){
	var ref=uses[i];
	ref=ref.substring(1);
	var def=this.map_refs[ref];
        defstr+=this.xml2str(def,'    ');
    }
    defstr+="  </defs>\n";

    // Split SVG
    var i=image.svg.indexOf(">")+1; // End of opening svg tag
    var svgtag=image.svg.substring(0,i);
    var svg=image.svg.substring(i);

    svgtag=svgtag.replace(/<svg/,'<svg xmlns="http://www.w3.org/2000/svg"');

    // Insert defs just after SVG tag
    var svgstr=svgtag+"\n"+defstr+svg;

    return svgstr;
};

SVGArray.prototype.xml2str = function(xml, indent) {
    return XML.stringify(xml, indent);
};

SVGArray.prototype.xml2str_old = function(xml, indent)
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
    str+=this.xml2str(c[i],indent+'  ');
    closing_indent=indent; // The parent closing tag will be on new line so indent.
  }
  str+=closing_indent+'</'+xml.nodeName+'>\n';

  return str;
}


SVGArray.prototype.clear = function ()
{
    this.map_defs={};
    this.images=[];
}

