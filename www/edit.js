/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2016,2018  Andrew Rogers
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
        div=div;
    } else{
        div=document.createElement("div");
        div.setAttribute("class","editor");
        document.body.appendChild(div);
    }

    this.createInDiv(div);
};

Editor.prototype.createInDiv = function( div ) {
    this.div = div;

    // Create, style and append the top file menu bar
    this.div_topbar = document.createElement("div");
    this.div_topbar.setAttribute("class","editor_top");
    this.div.appendChild(this.div_topbar);

    // Create and append file menu list
    this.div_filelist=document.createElement("div");
    this.div_topbar.appendChild(this.div_filelist);
    this.fs = new FileSelector(this.div_filelist, listfiles);

    // Create, style and append the Load button
    this.btn_load = document.createElement("button");
    this.btn_load.setAttribute("class","editor_top_lr");
    this.btn_load.innerHTML = "Load...";
    this.div_topbar.appendChild(this.btn_load);

    // Create, style and append the filename input field
    this.input_filename = document.createElement("input");
    this.input_filename.setAttribute("type","text");
    this.input_filename.setAttribute("class","editor_top_centre");
    this.div_topbar.appendChild(this.input_filename);

    // Create, style and append the Save button
    this.btn_save = document.createElement("button");
    this.btn_save.setAttribute("class","editor_top_lr");
    this.btn_save.innerHTML = "Save";
    this.div_topbar.appendChild(this.btn_save);

    // Create, style and append the editing area
    this.ta = document.createElement("textarea");
    this.ta.setAttribute("class","editor_top_lr");
    this.ta.onkeydown = function(e) {
        // Detect tab key
        if( e.keyCode == 9 ) {
            // Prevent browser tabbing to next widget
            e.preventDefault();
            
            // Insert tab char into value
            var ss = this.selectionStart;
            this.value = this.value.substring(0, ss)
                       + '\t'
                       + this.value.substring(this.selectionEnd);
                       
            // Move caret after inserted tab
            this.selectionEnd = ss+1;
        }
    }
    this.div.appendChild(this.ta);

    var that=this;
    this.btn_load.onclick=function(){that.loadClicked();};
    this.btn_save.onclick=function(){that.saveClicked();};
    
};

Editor.prototype.loadClicked = function() {
    var that = this;
    this.fs.show(function(fn){ // Show the file selector
        fileread(fn, function(err,data){
            that.ta.value=data;
        });
        that.input_filename.value=fn;
    });
};

Editor.prototype.saveClicked = function() {
    filewrite( this.input_filename.value, this.ta.value );
};

Editor.prototype.getText = function() {
    return this.ta.value;
};

