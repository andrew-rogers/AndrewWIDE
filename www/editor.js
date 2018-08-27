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

function Toolbar(div){
    this.div = div;

    // Create the left span
    this.span_left = document.createElement("span");
    this.span_left.setAttribute("class","toolbar_left");
    this.div.appendChild(this.span_left);

    // Create the right span
    this.span_right = document.createElement("span");
    this.span_right.setAttribute("class","toolbar_right");
    this.div.appendChild(this.span_right);

    // Create the centre span
    this.span_centre = document.createElement("span");
    this.span_centre.setAttribute("class","toolbar_centre");
    this.div.appendChild(this.span_centre);
};

Toolbar.prototype.createLeftButton = function(text, onclick) {
    var btn=document.createElement("button");
    btn.innerHTML = text;
    btn.onclick = onclick;
    this.span_left.appendChild(btn);
    return btn;
};

Toolbar.prototype.createRightButton = function(text, onclick) {
    var btn=document.createElement("button");
    btn.innerHTML = text;
    btn.onclick = onclick;
    this.span_right.appendChild(btn);
    return btn;
};

Toolbar.prototype.addCentreElement = function(elem) {
    this.span_centre.appendChild(elem);
    return elem;
};

function Editor(div, mode) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        div.setAttribute("class","editor");
        document.body.appendChild(div);
    }

    this.mode=mode || "text/plain";
    this.createInDiv(div);
};

Editor.prototype.createInDiv = function( div ) {
    this.div = div;

    // Create, style and append the top file menu bar
    this.div_topbar = document.createElement("div");
    this.div_topbar.setAttribute("class","toolbar");
    this.div.appendChild(this.div_topbar);

    // Create and append file menu list
    this.div_filelist=document.createElement("div");
    this.div_filelist.setAttribute("class","file_menu");
    this.div_topbar.appendChild(this.div_filelist);
    this.fs = new FileSelector(this.div_filelist, listfiles);

    // Add the toolbar, this will contain the load/save buttons and filename field
    this.toolbar = new Toolbar(this.div_topbar);

    // Create, style and append the filename input field
    this.input_filename = document.createElement("input");
    this.input_filename.setAttribute("type","text");
    this.input_filename.setAttribute("style","width: 100%; height: 34px");
    this.toolbar.addCentreElement(this.input_filename);

    // Create load button in left span
    var that = this;
    this.toolbar.createLeftButton("Load...", function(){that.loadClicked();});

    // Create the save button in right span
    this.toolbar.createRightButton("Save", function(){that.saveClicked();});

    // Create, style and append the editing area
    this.div_ta = document.createElement("div");
    this.div_ta.innerHTML = "<h1>Title</h1>";
    this.div_ta.setAttribute("contenteditable","true");
    this.div_ta.setAttribute("class","editarea_div");
    this.div.appendChild(this.div_ta);

    

};

Editor.prototype.loadClicked = function() {
    var that = this;
    this.fs.show(function(filename){ // Show the file selector
        fileread(filename, function( err, content ) {
            that.div_ta.innerHTML = content;
        });
        that.input_filename.value=filename;
    });
};

Editor.prototype.saveClicked = function() {
    filewrite( this.input_filename.value, this.div_ta.innerHTML );
};

Editor.prototype.getFilename = function() {
    return this.input_filename.value;
};


