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

var Tokeniser = function(input) {
    this.buffer = input;
};

// Read until delim is matched, delim can be a regular expression, eg. '\s+' for one or more whitespace
Tokeniser.prototype.readToken = function(delim) {
    if(typeof delim === 'undefined') delim = /\s+/; // If not defined, define as whitespace.
    var m = this.buffer.match(delim);
    var ret='';
    if(m == null){ // Return remaining if no match
	ret = this.buffer;
	this.buffer='';
    }else{
	ret = this.buffer.substring(0,m.index);
	this.buffer = this.buffer.substring(m.index+m[0].length);
    }
    return ret;

};

// Read remaining contents of buffer
Tokeniser.prototype.readRemaining = function() {
    var ret = this.buffer;
    this.buffer='';
    return ret;
};

// Returns number of remaining characters
Tokeniser.prototype.remaining = function() {
    return this.buffer.length;
};

function query_sh(script,stdin,callback)
{
  var b64=btoa(stdin);
  var blob = new Blob([script,"\n\n",b64], { type: "text/plain" });
  var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      var rt=xmlhttp.responseText;
      var i=rt.indexOf("\n");
      var err=rt.substring(0,i);
      rt=rt.substring(i+1);
      i=rt.indexOf("\n");
      var h2=rt.substring(0,i);
      rt=rt.substring(i+1);
      if(callback)callback(err,atob(rt));
    }
  };
  xmlhttp.open("POST", "/cgi-bin/aw.sh", true);
  xmlhttp.send(blob);
}


function fileread(fn, callback)
{
  var script='cat "'+fn+'"';
  query_sh(script, '', callback);
}

function filewrite(fn, data, callback)
{
  var script='cat > "'+fn+'"';
  query_sh(script, data);
}

function listfiles(path, callback)
{
  query_sh('listfiles "'+path+'"', "", function(err,data){
    data=data.split('\n');
    var dir=data[0];
    data[1]="d\t.." // Replace empty line with ".."
    var list=[];
    for( var i=1; i<data.length; i++ )
    {
      var obj = parse_listfiles_line( data[i] );
      if( obj.flags ) list.push( obj );
    }
    if( callback )callback({dir: dir, list: list});
  });
}

function parse_listfiles_line( line )
{
  var tok = new Tokeniser(line);
  return {flags:        tok.readToken(/\t/),
          path:         tok.readRemaining()
  };
}


