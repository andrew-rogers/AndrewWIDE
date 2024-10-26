/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2024  Andrew Rogers
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

let aw = null;

export function init(a) {
  aw = a;
  aw.addRenderer("mono", render);
}

function handleDroppedFile( obj, ta, filename ) {
  var reader = new FileReader();
  reader.onload = function(event) {
    obj.filename = filename;
    obj.content = event.target.result;
    ta.value = obj.content;
  };
  reader.readAsText(filename);
}

function render(section) {

  let obj = section.obj;
  let div = section.div;

  // Clear the div
  div.innerHTML="";

  // Create controls
  let controls = new NavBar();
  let butt_run = document.createElement("button");
  butt_run.innerHTML="Run";
  controls.addRight(butt_run);
  let butt_drop = document.createElement("button");
  butt_drop.innerHTML="Drop file here";
  butt_drop.className="drop";
  controls.addRight(butt_drop);
  div.appendChild(controls.elem);

  // Put the content into the textarea
  let ta = section.showSource(false);

  // Drop handlers
  let that = this;
  butt_drop.ondrop = function(e) {
    e.preventDefault();
    const filename = e.dataTransfer.files[0];
    handleDroppedFile( obj, ta, filename );
    return false;
  };
  ta.ondrop = function(e) {
    e.preventDefault();
    const filename = e.dataTransfer.files[0];
    handleDroppedFile( obj, ta, filename );
    return false;
  };

  // Run handler
  butt_run.onclick = function(e) {
    obj.content = ta.value;
    section.enqueue();
  };
}
