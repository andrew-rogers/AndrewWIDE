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

var CppEditor = function(div) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        document.body.appendChild(div);
    }
    this.debug=null;
    this.createInDiv(div);
}

CppEditor.prototype.createInDiv = function( div ) {
    this.div = div;

    // Create, style and append the top file menu bar
    this.div_topbar = document.createElement("div");
    this.div_topbar.setAttribute("class","editor_top");
    this.div.appendChild(this.div_topbar);

    // Create and append file menu list
    this.div_filelist=document.createElement("div");
    this.div_topbar.appendChild(this.div_filelist);
    this.fs = new FileSelector(this.div_filelist, this.listfiles);

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

    // Create, style and append the Run button
    this.btn_run = document.createElement("button");
    this.btn_run.setAttribute("class","editor_top_lr");
    this.btn_run.innerHTML = "Run";
    this.div_topbar.appendChild(this.btn_run);

    // Create, style and append the editing area
    this.ta = document.createElement("textarea");
    this.div.appendChild(this.ta);
    this.editor = CodeMirror.fromTextArea(this.ta, {
        lineNumbers: true,
        matchBrackets: true,
        mode: "text/x-c++src"
    });

    var that=this;
    this.btn_load.onclick=function(){that.loadClicked();};
    this.btn_save.onclick=function(){that.saveClicked();};
    
};

CppEditor.prototype.loadClicked = function() {
    var that = this;
    this.fs.show(function(fn){ // Show the file selector
        that.load(fn);
        that.input_filename.value=fn;
    });
};

CppEditor.prototype.saveClicked = function() {
    var obj={cmd: "save"};
    obj["content"]=this.editor.getValue();
    obj["path"]=this.input_filename.value;
    JsonArrayBuffers.query("/cgi-bin/aw_fs.cgi", obj, function( response ) {
        ///@todo When a response for save is defined, handle it here.
    });
};

/*CppEditor.prototype.handleResponse = function(obj) {
    if(this.debug) this.debug.log("Response");
};*/

CppEditor.prototype.load = function(filename) {
    var obj={path: filename, cmd: "load"};
    var that = this;
    JsonArrayBuffers.query("/cgi-bin/aw_fs.cgi", obj, function( response ) {
        that.editor.setValue(response["content"]);
    });
};

CppEditor.prototype.listfiles = function(dir, callback) {
    var obj={path: dir, cmd: "listfiles"};
    JsonArrayBuffers.query("/cgi-bin/aw_fs.cgi", obj, callback);
};

