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

var FileSelector = function( div )
{
  this.div=div;
  this.selector=new Menu(div);
  this.dir="html";
};

FileSelector.prototype.show = function( callback )
{
  this.selector.clear();
  var that=this;
  ls(this.dir,function(obj) {
    var list=obj.list;
    that.dir=obj.dir;
    
    if( list.length==0 )
    {
       that.dir='';
       list.push({flags: 'dwrx------', path: 'sdcard'});
       list.push({flags: 'dwrx------', path: 'data/data/org.connectbot/AndrewWIDE'});
    }
 
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
      if( list[i].flags[0]=='d' )
      {
        that.dir=that.dir+'/'+list[i].path;
        that.show( callback );
      }
      else
      {
        callback(that.dir+'/'+list[i].path);
      }
    });
  });
};
