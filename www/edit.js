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

function Editor(div, mode, extra_buttons) {
    if(div){
        div=div;
    } else{
        div=document.createElement("div");
        div.setAttribute("class","editor");
        document.body.appendChild(div);
    }

    this.mode=mode || "text/plain";
    this.extra_buttons=extra_buttons || [];


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
    this.btn_load.setAttribute("class","editor_top_l");
    this.btn_load.innerHTML = "Load...";
    this.div_topbar.appendChild(this.btn_load);

    // Create, style and append the Save button
    this.btn_save = document.createElement("button");
    this.btn_save.setAttribute("class","editor_top_r");
    this.btn_save.innerHTML = "Save";
    this.div_topbar.appendChild(this.btn_save);

    // Create, style and append the extra buttons
    for(var i=0; i<this.extra_buttons.length; i++) {
        var btn=document.createElement("button");
        btn.setAttribute("class","editor_top_r");
        btn.innerHTML = this.extra_buttons[i].text;
        btn.onclick = this.extra_buttons[i].onclick;
        this.div_topbar.appendChild(btn)
        this.extra_buttons[i].btn=btn;
    }

    // Create, style and append the filename input field
    this.span_filename = document.createElement("span");
    this.div_topbar.appendChild(this.span_filename);
    this.input_filename = document.createElement("input");
    this.input_filename.setAttribute("type","text");
    this.span_filename.appendChild(this.input_filename);

    // Create, style and append the editing area
    this.div_ta = document.createElement("div");
    this.div_ta.setAttribute("class","editarea_div");
    this.div.appendChild(this.div_ta);

    this.ta = document.createElement("textarea");
    this.div_ta.appendChild(this.ta);

    // Assign the textarea to the editor
    if (typeof CodeMirror !== 'undefined') {
        this.editor = CodeMirror.fromTextArea(this.ta, {
            lineNumbers: true,
            matchBrackets: true,
            mode: this.mode
        });
    } else {
        this.editor = new NotCodeMirror(this.ta);
    }

    var that=this;
    this.btn_load.onclick=function(){that.loadClicked();};
    this.btn_save.onclick=function(){that.saveClicked();};
};

Editor.prototype.loadClicked = function() {
    var that = this;
    this.fs.show(function(filename){ // Show the file selector
        fileread(filename, function( err, content ) {
            that.editor.setValue(content);
        });
        that.input_filename.value=filename;
    });
};

Editor.prototype.saveClicked = function() {
    filewrite( this.input_filename.value, this.editor.getValue() );
};

Editor.prototype.getFilename = function() {
    return this.input_filename.value;
};


