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
  // Get elements
  var ta_filename=document.getElementById("ta_filename");
  var div_filelist=document.getElementById("div_filelist");
  var btn_load = document.getElementById('btn_load'); 
  var btn_save = document.getElementById('btn_save'); 
  var ta_edit=document.getElementById("ta_edit");
  var div_html=document.getElementById("div_html");
  var btn_mdhtml = document.getElementById('btn_md_html');

  var edit=new Edit(ta_edit);
  var fs=new FileSelector(div_filelist);

  MathJax.Hub.Config({
    tex2jax: {inlineMath: [["$","$"],["\\(","\\)"]]}
  });

  // Handle Save button click
  btn_save.addEventListener('click', function() {
    edit.save(ta_filename.value);
  }, false);

  // Handle Load button click
  btn_load.addEventListener('click', function() {
    fs.show(function(fn){ // Show the file selector
      edit.load(fn);
      ta_filename.value=fn;
    });
  }, false);

  // Handle MD / HTML button click
  btn_mdhtml.addEventListener('click', function() {
    div_html.innerHTML=ta_edit.value;
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,div_html]);
  }, false);

  // Register EndProcess hook
  MathJax.Hub.Register.MessageHook("End Process", function(message) {
    div_html.innerHTML=marked(div_html.innerHTML);
  });
}
