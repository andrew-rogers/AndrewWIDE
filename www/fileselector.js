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

var FileSelector = function( div, ls )
{
  this.div=div;
  this.ls=ls;
  this.selector=new Menu(div);
  this.dir="";
};

FileSelector.prototype.show = function( callback )
{
  this.selector.clear();
  var that=this;
  this.ls(this.dir,function(obj) {
    var list=obj.list;
    that.dir=obj.dir;
    
    that.selector.clear();
    for( var i=0; i<list.length; i++ )
    {
      var item=document.createElement('p');
      item.innerHTML=list[i].path;
      if( list[i].flags[0]=='d' )
      {
        item.className='dir_item';
      }
      that.selector.add(item);
    }
    that.selector.show(function(i, fn){
      var path = list[i].path;
      if( path[0]!='/' ) path = that.dir+'/'+path;
      if( list[i].flags[0]=='d' )
      {
        that.dir=path;
        that.show( callback );
      }
      else
      {
        callback(path);
      }
    });
  });
};

