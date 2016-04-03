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

var Menu = function(div) {
  this.div=div;
  this.onselect=null;
  this.numitems=0;
};

Menu.prototype.clear = function() {
  this.numitems=0;
  this.div.innerHTML='';
};

Menu.prototype.add = function(item) {
  var that=this;
  var ni=this.numitems;
  item.addEventListener('click', function() {
    if(that.onselect) that.onselect(ni,this.innerHTML);
    that.div.style.display="none";
  }, false);

  this.numitems+=1;
  this.div.appendChild(item);
};

Menu.prototype.show = function(onselect){
  this.onselect=onselect;
  this.div.style.display="block";
};

var FileSelector = function( selector )
{
  this.selector=selector;
  this.dir="html";
};

FileSelector.prototype.show = function( callback )
{
  this.selector.clear();
  var that=this;
  ls(this.dir,function(obj) {
    var list=obj.list;
    that.dir=obj.dir;
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
  var ta_filename=document.getElementById("ta_filename");
  var btnload = document.getElementById('btn_load'); 
  var btnsave = document.getElementById('btn_save'); 
  var menu=new Menu(document.getElementById("div_filelist"));
  var edit=new Edit(document.getElementById("ta_edit"));
  var fs=new FileSelector(menu);

  // Handle Save button click
  btnsave.addEventListener('click', function() {
    edit.save(ta_filename.value);
  }, false);

  // Handle Load button click
  btnload.addEventListener('click', function() {
    fs.show(function(fn){ // Show the file selector
      edit.load(fn);
      ta_filename.value=fn;
    });
  }, false);
}
