/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2018  Andrew Rogers
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

function fileread(fn, callback)
{
  var script='cat "'+fn+'"';
  query_sh(script, '', callback);
}

function filewrite(fn, data, callback)
{
  var script='cat > "'+fn+'"';
  query_sh(script, data, callback);
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
      var line = data[i];
      if(line.length>2 && line[1]=="\t")
      {
        var obj = { flags: line[0], path: line.substring(2) };
        list.push( obj );
      }
    }
    if( callback )callback({dir: dir, list: list});
  });
}

