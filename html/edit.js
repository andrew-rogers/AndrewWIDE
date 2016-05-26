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

var Editor = function(div) {
    if(div){
        this.div=div;
    } else{
        this.div=document.createElement("div");
        document.body.appendChild(this.div);
    }

    // Add file menu
    this.div_menu=document.createElement("div");
    this.btn_load=document.createElement("button");
    this.btn_load.innerHTML="Load...";
    this.div_menu.setAttribute("class","menu");
    this.ta_filename=document.createElement("textarea");
    this.ta_filename.setAttribute("cols","100");
    this.div_menu.appendChild(this.btn_load);
    this.div_menu.appendChild(this.ta_filename);
    this.btn_save = document.createElement("button");
    this.btn_save.innerHTML="Save";
    this.div_menu.appendChild(this.btn_save);
    this.div_filelist=document.createElement("div");
    this.div_menu.appendChild(this.div_filelist);
    this.div.appendChild(this.div_menu);

    var fs = new FileSelector(this.div_filelist);

    var that = this;

    // Handle Load button click
    this.btn_load.addEventListener('click', function() {
        fs.show(function(fn){ // Show the file selector
            that.load(fn);
            that.ta_filename.value=fn;
        });
    }, false);

    // Handle Save button click
    this.btn_save.addEventListener('click', function() {
        that.save(that.ta_filename.value);
    }, false);



    // Add textarea
    this.ta=document.createElement("textarea");
    this.ta.setAttribute("rows","30");
    this.ta.setAttribute("cols","100");
    this.div.appendChild(this.ta);
};

Editor.prototype.save = function( fn, callback ) {
    filewrite( fn, this.ta.value );
};

Editor.prototype.load = function( fn, callback ) {
  var that=this;
  fileread(fn, function(err,data){
    that.ta.value=data;
  });
};

Editor.prototype.getText = function() {
    return this.ta.value;
};

/*window.onload=function(e){
    var edit=new Editor();
}*/