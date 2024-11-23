/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2022  Andrew Rogers
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

window.AndrewWIDE = window.AndrewWIDE || {};

AndrewWIDE.loadScripts = function(urls, callback) {
  let cnt = 0;
  for (var i=0; i<urls.length; i++) {
    var script = document.createElement('script');
    script.setAttribute('src', urls[i]);
    script.setAttribute('type', 'text/javascript');
    script.onload = function() {
      cnt = cnt + 1;
      if (cnt == urls.length) {
        if (callback) callback();
      }
    };
    document.head.appendChild(script);
  }

  // Do additional check in case urls is empty array.
  if (cnt == urls.length) {
    if (callback) callback();
  }
};

class AwDocViewer {
  constructor() {
    this.#disableDrop();
    let that = this;
    this.#loadScripts(() => {
      that.#render();
    });
  }

  #disableDrop() {
    // Prevent dropped files being openned in new browser tabs.
    window.addEventListener("dragover",function(e){
        e.preventDefault();
    },false);
    window.addEventListener("drop",function(e){
        e.preventDefault();
    },false);
  }

  #loadScripts(callback) {
    let scripts = [];

    // Pyodide has to be loaded before require.js https://github.com/pyodide/pyodide/issues/4863
    if (typeof loadPyodide === 'undefined') scripts.push("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");
    if (typeof window['@hpcc-js/wasm'] === 'undefined') scripts.push("https://unpkg.com/@hpcc-js/wasm@0.3.11/dist/index.min.js");

    let that = this;
    AndrewWIDE.loadScripts(scripts, () => {
      that.#requireModules(callback);
    });
  }

  #render() {
    let fn = window.location.search;
    if (fn.startsWith("?idbs=")) {
      fn = decodeURIComponent(fn.slice(6));
      AndrewWIDE.loadDoc(fn);
    }
    else {
      let obj = {};
      const tas = document.getElementsByClassName('awjson');
      for (let i=0; i<tas.length; i++) {
        const ta = tas[i];
        obj[ta.id] = ta.value;
      }
      AndrewWIDE.createDoc(obj);
    }
  }

  #requireModules(callback) {
    let script = document.createElement('script');
    script.setAttribute('src', 'require.js');
    script.setAttribute('type', 'text/javascript');
    let that = this;
    script.onload = function() {
      require(["./modules"], function() {
        if (callback) callback();
      });
    };
    document.head.appendChild(script);
  }
}
