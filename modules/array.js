let arrays = {};
let array_ids = [];
let aw = {};

export function add(name, arr) {
    arrays[name] = arr;
}

export function init(a) {
    aw = a;
}

export function open(ptr) {
    var name = aw.wasm_rt.readString(ptr);
    arrays[name]= arrays[name] || [];
    array_ids.push(name);
    return array_ids.length - 1;
}

export function write(ptr) {
    var argss = aw.wasm_rt.read("S32", ptr, 3);
    var argsu = aw.wasm_rt.read("U32", ptr, 3);
    var name = array_ids[argss[0]];
    var arr = arrays[name];
    var vals = aw.wasm_rt.read("F32", argsu[1], argsu[2]);
    arr.push(...vals);
}

export function get(name) {
    return arrays[name];
}
