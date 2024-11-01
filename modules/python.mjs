/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2023  Andrew Rogers
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
let pyodide = null;
let loading = false;

// NOTE: The pyodide script must be loaded externally and before require.js is loaded.
//       See https://github.com/pyodide/pyodide/issues/4863

export function init(a) {
    aw = a;
    aw.addRenderer("python", render);
}

function loadPy(callback) {
  let suspend_id = null;

  async function load() {
    console.log("Got pyodide.js.");
    pyodide = await loadPyodide();
    console.log("Pyodide loaded.");
    await pyodide.loadPackage("scipy");
    console.log("Package scipy loaded");
    aw.resume(suspend_id);
    aw.pyodide = pyodide;
    if (callback) callback();
  }

  if ((!pyodide) && (!loading)) {
    suspend_id = aw.suspend('Loading Pyodide.');
    loading = true;
    load();
  }
};

function render(section) {

  // Put the content into an editor.
  let ed = section.showEditor(false, function() {
    section.obj.content = ed.ta.value;
    section.enqueue();
  });

  // Create a div for the execution result
  var div_result = document.createElement("div");
  section.div.appendChild(div_result);

  loadPy();

  function wrapper(section) {
    run(section);
  }

  section.setFunc(wrapper);
  section.enqueue();
}

function run(section) {

  // TODO: Process the inputs.

  pyodide.runPython(section.obj.content);

  // TODO: Process the outputs.
}
