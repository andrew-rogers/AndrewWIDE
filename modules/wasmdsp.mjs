let aw = {};

export function init(a) {
    aw = a;
    aw.addRenderer("awcppwasm_module", module);
}

function module(section) {
    console.log("Module");
    const id = aw.suspend("Loading WasmDSP modules.");
    requirejs(["WasmDSP"], function(wasmdsp){
        aw.WasmDSP = wasmdsp;
        wasmdsp.modules = wasmdsp.modules || {};
        const module = section.obj.module;
        const prefix = section.obj.prefix;
        requirejs([module], function(m){
            wasmdsp.modules[prefix] = m;
            wasmdsp.initialise(wasmdsp.modules, function() {
                aw.resume(id);
            });
        });
    });
}
