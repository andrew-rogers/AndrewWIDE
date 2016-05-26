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

function query_sh1(script,stdin,callback)
{
  var blob = new Blob([script,'\n\n',stdin], { type: "text/plain" });
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
      if(callback)callback(err,rt);
    }
  };
  xmlhttp.open("POST", "/cgi-bin/aw.sh", true);
  xmlhttp.send(blob);
}

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

function ls(path, callback)
{
  if( path[0]!='/' ) path="../../"+path;
  query_sh('cd "'+path+'" && pwd && ls -lea', "", function(err,data){
    data=data.split('\n');
    var dir=data[0];
    var list=[];
    for( var i=2; i<data.length; i++ )
    {
      var line=data[i];

      var index=line.indexOf(':');
      var info=line.substring(0,index+11);
      var fn=line.substring(index+12);

      // Get flags
      var index=info.indexOf(' ');
      var flags=info.substring(0,index);
      info=info.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces
      
      // Get links
      index=line.indexOf(' ');
      var links=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces

      // Get owner
      index=line.indexOf(' ');
      var owner=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces

      // Get group
      index=line.indexOf(' ');
      var group=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces
            
      // Get size
      index=line.indexOf(' ');
      var size=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces

      // Get month
      index=line.indexOf(' ');
      var month=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces

      // Get day of month
      index=line.indexOf(' ');
      var day=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces
            
      // Get time or year
      index=line.indexOf(' ');
      var time=line.substring(0,index);
      line=line.substring(index+1).replace(/^\s+/g,''); // Remove leading spaces
            

      list.push({flags: flags, path: fn});
    }
    if( callback )callback({dir: dir, list: list});
  });
}
