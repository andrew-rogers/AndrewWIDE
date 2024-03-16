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
let imports = {};
let initialised = false;
let module = null;
let prefix = "";
let wasmdsp = null;

export function init(a) {
    aw = a;
    aw.addRenderer("wasmcpp_module", renderModule);
    aw.addRenderer("wasmcpp", cpp);
    aw.addWasmImport = addWasmImport;
    aw.callWasmFunc = callWasmFunc;
}

function addWasmImport(name, func) {
    imports[name] = func;
}

function callWasmFunc(func_name) {
    if (!initialised) {
        const id = aw.suspend("Initialising wasm.");
        mergeImports();
        wasmdsp.initialise([module], function() {
            aw.resume(id);
            aw.wasm_mod = module.wasm;
            module.wasm.exports[func_name]();
        });
        initialised = true;
    }
    else {
        module.wasm.exports[func_name]();
    }
}

function cpp(section) {
    console.log(section);
    const func_name = section.obj.id;

    if (func_name != 'globals') {

        function wrapper(s) {
            let fn = prefix + func_name.substr(7);
            callWasmFunc(fn);
        }

        aw.addRunnable(section.obj, wrapper);
        aw.queueRun(section.obj.id);
    }
}

function mergeImports() {
    module.imports = module.imports || {};
    for (let k in imports) module.imports[k] = imports[k];
}

function renderModule(section) {
    console.log("Module");
    const id = aw.suspend("Loading WasmDSP modules.");
    requirejs(["WasmDSP"], function(w){
        wasmdsp = w;
        const module_name = section.obj.module;
        prefix = section.obj.prefix;
        requirejs([module_name], function(m){
            module = m;
            aw.resume(id);
        });
    });
}
