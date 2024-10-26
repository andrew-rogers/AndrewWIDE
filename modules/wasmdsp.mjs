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

let aw = {};
let initialised = false;
let module = null; // WasmDSP module for AwDoc functions.
let prefix = "";
let wasmdsp = null;

export function init(a) {
    aw = a;
    aw.addRenderer("wasmcpp_module", renderModule);
    aw.addRenderer("wasmcpp", cpp);
    aw.callWasmFunc = callWasmFunc;
    aw.getWasmArray = getArray;
    aw.loadWasmDSPModules = loadWasmDSPModules;
}

function callWasmFunc(func_name) {
    if (!initialised) {
        const id = aw.suspend("Initialising wasm.");
        initialised = true;
        wasmdsp.initialise([module], function() {
            aw.wasm_mod = module.wasm;
            module.wasm.exports[func_name]();
            aw.resume(id);
        });
    }
    else {
        module.wasm.exports[func_name]();
    }
}

function cpp(section) {
    section.showSource(false);

    const func_name = section.obj.id;

    if (func_name != 'globals') {

        function wrapper(s) {
            let fn = prefix + func_name.substr(7);
            callWasmFunc(fn);
        }

        section.setFunc(wrapper);
        aw.queueRun(section);
    }
}

function getArray(name) {
    let arrs = module.arrays;
    arrs[name] = arrs[name] || [];
    return arrs[name];
}

function loadWasmDSP(callback) {
  if (wasmdsp == null) {
    const id = aw.suspend("Loading WasmDSP.");
    requirejs(["WasmDSP"], function(w){
      wasmdsp = w;
      wasmdsp.modules = {};  // WasmDSP library modules.
      aw.WasmDSP = w;
      if (callback) callback();
      aw.resume(id);
    });
  }
  else {
    if (callback) callback();
  }
}

function loadWasmDSPModules(mods, callback) {
  loadWasmDSP(function(){
    let cnt = 0;
    const id = aw.suspend("Loading WasmDSP modules.");
    for (let i in mods) {
      require([mods[i]], function(m){
        wasmdsp.modules[mods[i]] = m;
        cnt++;
        if (cnt == mods.length) {
          wasmdsp.initialise(wasmdsp.modules, function() {
            if (callback) callback();
            aw.resume(id);
          });
        }
      });
    }
  });
}

function renderModule(section) {
    const id = aw.suspend("Loading WasmDSP module.");
    loadWasmDSP(function() {
        const module_name = section.obj.module;
        prefix = section.obj.prefix;
        requirejs([module_name], function(m){
            module = m;
            module.arrays = module.arrays || {};
            aw.resume(id);
        });
    });
}
